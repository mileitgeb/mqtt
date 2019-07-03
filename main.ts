//%color=#0B0B61 icon="\uf1eb" block="MQTT"

namespace MQTT {

    //% shim=serialBuffer::setSerialBuffer
    function setSerialBuffer(size: number): void {
        return null;
    }
    setSerialBuffer(128);

    type EvtMsg = (topic: string, data: string) => void;
    type EvtAct = () => void;

    let wificonnected: EvtAct = null;
    let wifidisconnected: EvtAct = null;
    let mqttconnected: EvtAct = null;
    let mqttdisconnected: EvtAct = null;
    let mqttmessage: EvtMsg = null;

    let wifiEvtConFlag: boolean = false;
    let wifiEvtDConFlag: boolean = false;
    let mqttEvtConFlag: boolean = false;
    let mqttEvtDConFlag: boolean = false;

    let FlagMQTTCon: boolean = false;
    let FlagWiFiCon: boolean = false;

    //% block="Initialize WiFi TX %tx|RX %rx|Baud rate %baudrate"
    //% baudrate.defl=BaudRate.BaudRate115200
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% weight = 50
    export function initializeWifi(tx: SerialPin, rx: SerialPin, baudrate: BaudRate): void {
        serial.redirect(tx, rx, baudrate);
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
            let serial_str = serial.readString();

            if (serial_str.includes("WiFi connected")) {
                FlagWiFiCon = true;
                wificonnected();
            }
            if (serial_str.includes("WiFi disconnected")) {
                FlagWiFiCon = false;
                wifidisconnected();
            }
            if (serial_str.includes("MQTT connected")) {
                FlagMQTTCon = true;
                mqttconnected();
            }
            if (serial_str.includes("MQTT disconnect")) {
                FlagMQTTCon = false;
                mqttdisconnected();
            }
            if (serial_str.includes("+MQM")) {
                let comma_pos: number = serial_str.indexOf(",");
                let topic: string = serial_str.substr(5, comma_pos - 5);
                let msg: string = serial_str.substr(comma_pos + 1, ) + serial.readString();
                mqttmessage(topic, msg);
            }
        })
    }

    //% block="Set WiFi to SSID %ssid | PWD %pwd"
    //% weight=49
    export function setWiFi(ssid: string, pwd: string): void {
        basic.pause(5000);
        serial.writeString("+WiFi\n");
        basic.pause(2000);
        serial.writeString(ssid + "\n");
        basic.pause(2000);
        serial.writeString(pwd + "\n");
    }

    //% block="Connect to MQTT server %server | Port %port | ID %id | Username %user | Password %password"
    //% blockExternalInputs=true
    //% weight=48
    export function connectMQTT(server: string, port: number, id: string, user: string, password: string): void {
        serial.writeString("+MQTT\n");
        basic.pause(2000);
        serial.writeString(server + "\n");
        basic.pause(2000);
        serial.writeNumber(port);
        serial.writeString("\n");
        basic.pause(2000);
        serial.writeString(id + "\n");
        basic.pause(2000);
        serial.writeString(user + "\n");
        basic.pause(2000);
        serial.writeString(password + "\n");
    }

    //% block="Subscribe topic %topic"
    //% weight=47
    export function MQTTSub(topic: string): void {
        serial.writeString("+MQTTSub\n");
        basic.pause(2000);
        serial.writeString(topic + "\n");
    }

    //% block="Publish to topic %topic | message %payload"
    //% weight=46
    export function MQTTPub(topic: string, payload: string): void {
        serial.writeString("+MQTTPub\n");
        basic.pause(2000);
        serial.writeString(topic + "\n");
        basic.pause(2000);
        serial.writeString(payload + "\n");
    }

    //% block="On MQTT received"
    //% weight=45
    //% draggableParameters
    export function OnMQTTReceived(body: (topic: string, ReceivedMQTTMessage: string) => void): void {
        mqttmessage = body;
    }

    //% block="On WiFi connected"
    //% advanced=true
    export function OnWiFiConnected(body: () => void) {
        wifiEvtConFlag = true;
        wificonnected = body;
    }

    //% block="On WiFI disconnect"
    //% advanced=true
    export function OnWiFiDisconnect(body: () => void) {
        wifiEvtDConFlag = true;
        wifidisconnected = body;
    }

    //% block="On MQTT connected"
    //% advanced=true
    export function OnMQTTConnected(body: () => void) {
        mqttEvtConFlag = true;
        mqttconnected = body;
    }

    //% block="On MQTT disconnect"
    //% advanced=true
    export function OnMQTTDisconnect(body: () => void) {
        mqttEvtDConFlag = true;
        mqttdisconnected = body;
    }

    //% block="WiFi connected"
    //% advanced=true
    export function flagwificonn(): boolean {
        return FlagWiFiCon;
    }

    //% block="MQTT connected"
    //% advanced=true
    export function flagmqttconn(): boolean {
        return FlagMQTTCon;
    }
}
