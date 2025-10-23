from bluepy.btle import Scanner, DefaultDelegate
import binascii
import requests
import logging
import time
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Define TARGET_URL and post_with_retries function
TARGET_URL = "http://192.168.88.108:8000/api/information/"

def post_with_retries(url, payload, headers=None, timeout=10, retries=3, backoff=2):
    headers = headers or {"Content-Type": "application/json"}
    attempt = 0
    while attempt < retries:
        try:
            r = requests.post(url, json=payload, headers=headers, timeout=timeout)
            r.raise_for_status()
            return r
        except Exception as e:
            attempt += 1
            logging.warning("POST attempt %d failed: %s", attempt, e)
            if attempt >= retries:
                logging.error("All POST attempts failed.")
                raise
            time.sleep(backoff ** attempt)

target_addr = "A4:C1:38:0F:31:17"  # Replace with your device address

class ScanDelegate(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def parse_ad_data(self, raw_data):
        data = bytes.fromhex(raw_data)
        i = 0
        parsed_data = {}
        while i < len(data):
            length = data[i]
            if length == 0:
                break
            ad_type = data[i+1]
            ad_data = data[i+2 : i+1+length]
            # Store the raw AD data based on its type
            parsed_data[ad_type] = ad_data
            # Move to the next AD structure
            i += 1 + length
        print(parsed_data)
        return parsed_data

    def handleDiscovery(self, dev, isNewDev, isNewData):
        if isNewDev:
            if dev.addr.lower() == target_addr.lower():
                print(f"Discovered target device!")
        elif isNewData:
            if dev.addr.lower() == target_addr.lower():
                print(f"Received new data from target device")
                print("Raw Advertising Data (Hex):")
                raw_data = dev.rawData.hex()
                print(f"  {raw_data}")
                print("--------------------------------------------------")
                # Parse the raw advertising data
                parsed = self.parse_ad_data(raw_data)
                print("Parsed Advertising Data:")
                for ad_type, ad_data in parsed.items():
                    print(f"  Type {ad_type}: {ad_data.hex()}")
                    if(ad_type == 0x16): # Service Data - 16-bit UUID
                        temp = int(ad_data[8:10].hex(), 16) / 10.0
                        humid = int(ad_data[10:11].hex(), 16)
                        batt = int(ad_data[11:12].hex(), 16)
                        byteMV = int(ad_data[12:14].hex(), 16)
                        print(f"   Temperature: {temp}°C")
                        print(f"   Humidity: {humid}%")
                        print(f"   Battery: {batt}%")
                        print(f"   Battery Voltage: {byteMV}mV")
                        
                        # Prepare data payload
                        data = {
                            "temperature": temp,
                            "humidity": humid,
                            "battery": batt,
                            "voltage": byteMV,
                            "timestamp": datetime.utcnow().isoformat() + "Z"
                        }
                        
                        # Send data to TARGET_URL
                        try:
                            logging.info("Sending data to server: %s", data)
                            resp = post_with_retries(TARGET_URL, data)
                            logging.info("POST %s -> %s", TARGET_URL, resp.status_code)
                        except Exception as e:
                            logging.error("Failed to POST data: %s", e)
                            
                print("--------------------------------------------------")

# Initialize scanner
scanner = Scanner().withDelegate(ScanDelegate())
devices = scanner.scan(600.0) # Scan for () seconds
