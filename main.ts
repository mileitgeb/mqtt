//%color=#0B0B61 icon="\uf1eb" block="IoT"

namespace MQTT {

    //% shim=ESP8266::setSerialBuffer
    function setSerialBuffer(size: number): void {
        return null;
    }
    setSerialBuffer(128);

    //%block="Initialize WiFi TX %tx|RX %rx|Baud rate %baudrate"
    //%baudrate.defl=BaudRate.BaudRate115200
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    export function initializeWifi(tx: SerialPin, rx: SerialPin, baudrate: BaudRate): void {
        serial.redirect(tx, rx, baudrate);
    }

    //% block="Set WiFi to SSID %ssid | PWD %pwd"
    export function setWiFi (ssid: string, pwd: string): void {
        serial.writeString("+WiFi\r\n");
        basic.pause(500);
        serial.writeString(ssid + "\r\n");
        basic.pause(500);
        serial.writeString(pwd + "\r\n");
        basic.pause(500);
    }

    //% block="Connect to MQTT server %server | Port %port | ID %id | User name %user | User password % password"
    //% blockExternalInputs=true
    export function connectMQTT(server: string, port: number, id: string, user: string, password: string): void{
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
    export function MQTTSub(topic: string): void{
        serial.writeString("+MQTTSub");
        basic.pause(500);
        serial.writeString(topic + "\r\n");
        basic.pause(500);
    }

    //% block="Publish to topic %topic | message %payload"
    export function MQTTPub(topic: string, payload: string): void{
        serial.writeString("+MQTTPub\r\n");
        basic.pause(500);
        serial.writeString(topic + "\r\n");
        basic.pause(500);
        serial.writeString(payload + "\r\n");
        basic.pause(500);
    }
}