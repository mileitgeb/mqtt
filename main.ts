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

    let wifiEvtFlag: boolean = false;
    let mqttEvtFlag: boolean = false;

    let mqttflag: boolean = false;
    let mqttTopic: string = "";

    let mqttTopics: string[] = [""];

    //% block="Initialize WiFi TX %tx|RX %rx|Baud rate %baudrate"
    //% baudrate.defl=BaudRate.BaudRate115200
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% weight = 100
    export function initializeWifi(tx: SerialPin, rx: SerialPin, baudrate: BaudRate): void {
        serial.redirect(tx, rx, baudrate);
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
            let serial_str = serial.readString();

            if (serial_str.includes("WiFi connected") && wifiEvtFlag) {
                wificonnected();
            }
            if (serial_str.includes("WiFi disconnected") && wifiEvtFlag) {
                wifidisconnected();
            }
            if (serial_str.includes("MQTT connected") && mqttEvtFlag) {
                mqttconnected();
            }
            if (serial_str.includes("MQTT disconnect") && mqttEvtFlag) {
                mqttdisconnected();
            }
            if (serial_str.includes("+MQM")) {
                for (let i = 0; i <= mqttTopics.length; i++) {
                    mqttflag = true;
                    mqttTopic = mqttTopics[i];
                    break;
                }
            }
            if (mqttflag) {
                mqttflag = false;
                let comma_pos: number = serial_str.indexOf(",");
                let topic: string = serial_str.substr(5, comma_pos);
                let msg: string = serial_str.substr(comma_pos + 1, );
                mqttmessage(topic, msg);
            }
        })
    }

    //% block="Set WiFi to SSID %ssid | PWD %pwd"
    //% weight=99
    export function setWiFi(ssid: string, pwd: string): void {
        serial.writeString("+WiFi\r\n");
        basic.pause(500);
        serial.writeString(ssid + "\r\n");
        basic.pause(500);
        serial.writeString(pwd + "\r\n");
        basic.pause(500);
    }

    //% block="Connect to MQTT server %server | Port %port | ID %id | User %user | User % password"
    //% blockExternalInputs=true
    //% weight=98
    export function connectMQTT(server: string, port: number, id: string, user: string, password: string): void {
        serial.writeString("+MQTT\r\n");
        basic.pause(500);
        serial.writeString(server + "\r\n");
        basic.pause(500);
        serial.writeNumber(port);
        serial.writeString("\r\n");
        basic.pause(500);
        serial.writeString(user + "\r\n");
        basic.pause(500);
        serial.writeString(password + "\r\n");
        basic.pause(500);
    }

    //% block="Subscribe topic %topic"
    //% weight=97
    export function MQTTSub(topic: string): void {
        mqttTopics.push(topic);
        serial.writeString("+MQTTSub");
        basic.pause(500);
        serial.writeString(topic + "\r\n");
        basic.pause(500);
    }

    //% block="Publish to topic %topic | message %payload"
    //% weight=96
    export function MQTTPub(topic: string, payload: string): void {
        serial.writeString("+MQTTPub\r\n");
        basic.pause(500);
        serial.writeString(topic + "\r\n");
        basic.pause(500);
        serial.writeString(payload + "\r\n");
        basic.pause(500);
    }

    //% block="On MQTT received"
    export function OnMQTTReceived(body: (topic: string, ReceivedMQTTMessage: string) => void): void {
        mqttmessage = body;
    }

    //% block="On WiFi connected"
    //%advanced=true
    export function OnWiFiConnected(body: () => void) {
        wificonnected();
    }

    //% block="On WiFI disconnect"
    //%advanced=true
    export function OnWiFiDisconnect(body: () => void) {
        wifidisconnected();
    }

    //% block="On MQTT connected"
    //%advanced=true
    export function OnMQTTConnected(body: () => void) {
        mqttconnected();
    }

    //% block="On MQTT disconnect"
    //%advanced=true
    export function OnMQTTDisconnect(body: () => void) {
        mqttdisconnected();
    }
}
