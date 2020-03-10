#!/usr/bin/python
import sys, struct, serial, requests, json, time
import numpy as np
from biosppy.signals import bvp

def wait_for_ack():
   ddata = ""
   ack = struct.pack('B', 0xff)
   while ddata != ack:
      ddata = ser.read(1)
      print "0x%02x" % ord(ddata[0])
	  
   return

if len(sys.argv) < 2:
   print "no device specified"
   print "You need to specify the serial port of the device you wish to connect to"
   print "example:"
   print "   aAccel5Hz.py Com10"
   print "or"
   print "   aAccel5Hz.py /dev/rfcomm0"
else:
   ser = serial.Serial(sys.argv[1], 115200)
   ser.flushInput()
   print "port opening, done."

# send the set sensors command
   ser.write(struct.pack('BBBB', 0x08 , 0x04, 0x01, 0x00))  #GSR and PPG
   wait_for_ack()   
   print "sensor setting, done."

# Enable the internal expansion board power
   ser.write(struct.pack('BB', 0x5E, 0x01))
   wait_for_ack()
   print "enable internal expansion board power, done."

# send the set sampling rate command

   '''
    sampling_freq = 32768 / clock_wait = X Hz
   '''
   sampling_freq = 20
   clock_wait = (2 << 14) / sampling_freq

   ser.write(struct.pack('<BH', 0x05, clock_wait))
   wait_for_ack()

# send start streaming command
   ser.write(struct.pack('B', 0x07))
   wait_for_ack()
   print "start command sending, done."

# read incoming data
   allHR = []
   ddata = ""
   numbytes = 0
   framesize = 8 # 1byte packet type + 3byte timestamp + 2 byte GSR + 2 byte PPG(Int A13)

   print "Packet Type\tTimestamp\tGSR\tPPG"
   try:
      while True:
         while numbytes < framesize:
            ddata += ser.read(framesize)
            numbytes = len(ddata)
         
         data = ddata[0:framesize]
         ddata = ddata[framesize:]
         numbytes = len(ddata)

         # read basic packet information
         (packettype) = struct.unpack('B', data[0:1])
         (timestamp0, timestamp1, timestamp2) = struct.unpack('BBB', data[1:4])

         # read packet payload
         (PPG_raw, GSR_raw) = struct.unpack('HH', data[4:framesize])

         # get current GSR range resistor value
         Range = ((GSR_raw >> 14) & 0xff)  # upper two bits
         if(Range == 0):
            Rf = 40.2   # kohm
         elif(Range == 1):
            Rf = 287.0  # kohm
         elif(Range == 2):
            Rf = 1000.0 # kohm
         elif(Range == 3):
            Rf = 3300.0 # kohm

         # convert GSR to kohm value
         gsr_to_volts = (GSR_raw & 0x3fff) * (3.0/4095.0)
         GSR_ohm = Rf/( (gsr_to_volts /0.5) - 1.0)

         # convert to mS (1 Siemens = 1 Ohm^-1)
         GSR_ms = 1000.0/GSR_ohm

         # convert PPG to milliVolt value
         PPG_mv = PPG_raw * (3000.0/4095.0)

         # timestamp = timestamp0 + timestamp1*256 + timestamp2*65536

         timestamp = int(round(time.time() * 1000))
         # print timestamp

         # allHR.append(PPG_raw)

         sc = {
            "data": [
               {
                  "timestamp": timestamp,
                  "value": GSR_ms
               }
            ]
         }


         #calculate bpm for last X seconds: at 20HZ, that's every X*20 measurements.
         numMeasurements = 1200 #60 sec -> each timestamp will calculate for last 60sec 
         allHR.append(PPG_raw)
         if len(allHR) >= numMeasurements:
            # print allHR[len(allHR)-200:len(allHR)-1]
            x = bvp.bvp(allHR[len(allHR)-numMeasurements:len(allHR)-1], 20, show=False)
            # print "heart rate:"
            # print x['heart_rate']
            # allHR = []
            bpm = np.mean(x['heart_rate'])
            # print bpm
            hr = {
               "data":[
                  {
                     "timestamp": timestamp,
                     "value": bpm
                  }
               ]
            }
            hrReq = requests.post('http://localhost:3000/postHR', json = hr)


         
         # print json.dumps(obj)
         # print hr

         scReq = requests.post('http://localhost:3000/postSC', json = sc)
         # print hrReq.json()


         print "0x%02x\t\t%5d,\t%4f,\t%4d" % (packettype[0], timestamp, GSR_ms, PPG_mv)



   except KeyboardInterrupt:
#send stop streaming command
      ser.write(struct.pack('B', 0x20))
      print
      print "stop command sent, waiting for ACK_COMMAND"
      wait_for_ack()
      print "ACK_COMMAND received."
#close serial port
      ser.close()
      print "All done"