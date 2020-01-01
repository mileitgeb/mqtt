enum HttpMethod {
    GET,
    POST,
    PUT,
    HEAD,
    DELETE,
    PATCH,
    OPTIONS,
    CONNECT,
    TRACE
}

enum Newline {
    CRLF,
    LF,
    CR
}
//%color=#0B0B61 icon="\uf1eb" block="MQTT"

namespace MQTT {
    
    function writeToSerial(data: string, waitTime: number): void {
        serial.writeString(data + "\u000D" + "\u000A")
        if (waitTime > 0) {
            basic.pause(waitTime)
        }
    }
     let pauseBaseValue: number = 1000


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
    let mqttEvtRecFlag: boolean = false;

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
        writeToSerial("AT+RST", 2000)
        writeToSerial("AT+GMR", 5000)
        // WIFI mode = Station mode (client):
        writeToSerial("AT+CWMODE=1", 5000)
        writeToSerial("AT+CIPMUX=1", 3000)
        writeToSerial("AT+CIPSERVER=1,333", 3000)
        writeToSerial("AT+CWJAP=\"" + "FRITZ!Box 4040 RA" + "\",\"" + "09697271150147582482" + "\"", 6000)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
            let serial_str = serial.readString();

            if (serial_str.includes("WiFi connected")) {
                FlagWiFiCon = true;
                if (wifiEvtConFlag) wificonnected();
            }
            if (serial_str.includes("WiFi disconnected")) {
                FlagWiFiCon = false;
                if (wifiEvtDConFlag) wifidisconnected();
            }
            if (serial_str.includes("MQTT connected")) {
                FlagMQTTCon = true;
                if (mqttEvtConFlag) mqttconnected();
            }
            if (serial_str.includes("MQTT disconnect")) {
                FlagMQTTCon = false;
                if (mqttEvtDConFlag) mqttdisconnected();
            }
            if (serial_str.includes("+MQM") && mqttEvtRecFlag) {
                let comma_pos: number = serial_str.indexOf(",");
                let topic: string = serial_str.substr(5, comma_pos - 5);
                let msg: string = serial_str.substr(comma_pos + 1, serial_str.length - 5 - 1 - topic.length - 2);
                mqttmessage(topic, msg);
            }
        })
    }

    //% block="Set WiFi to SSID %ssid | PWD %pwd"
    //% weight=49
    export function setWiFi(ssid: string, pwd: string): void {
        /*basic.pause(5000);
        serial.writeString("+WiFi\n");
        basic.pause(2000);
        serial.writeString(ssid + "\n");
        basic.pause(2000);
        serial.writeString(pwd + "\n");*/
        writeToSerial("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"", 6000)
    }

    //% block="Connect to MQTT server %server|Port %port|ID %id|Username %user|Password %password"
    //% blockExternalInputs=true
    //% weight=48
    export function connectMQTT(server: string, port: number, id: string, user: string, password: string): void {
        basic.pause(2000);
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
        basic.pause(1000);
        serial.writeString("+MQTTSub\n");
        basic.pause(2000);
        serial.writeString(topic + "\n");
        basic.pause(2000);
    }

    //% block="Publish to topic %topic | message %payload"
    //% weight=46
    export function MQTTPub(topic: string, payload: string): void {
        basic.pause(1000);
        serial.writeString("+MQTTPub\n");
        basic.pause(2000);
        serial.writeString(topic + "\n");
        basic.pause(2000);
        serial.writeString(payload + "\n");
        basic.pause(2000);
    }

    //% block="On MQTT received"
    //% weight=45
    //% draggableParameters
    export function OnMQTTReceived(body: (topic: string, ReceivedMQTTMessage: string) => void): void {
        mqttEvtRecFlag = true;
        mqttmessage = body;
    }

    //% block="On WiFi connected"
    //% advanced=true
    // %weight = 98
    export function OnWiFiConnected(body: () => void) {
        wifiEvtConFlag = true;
        wificonnected = body;
    }

    //% block="On WiFI disconnect"
    //% advanced=true
    // %weight = 97
    export function OnWiFiDisconnect(body: () => void) {
        wifiEvtDConFlag = true;
        wifidisconnected = body;
    }

    //% block="On MQTT connected"
    //% advanced=true
    // %weight = 96
    export function OnMQTTConnected(body: () => void) {
        mqttEvtConFlag = true;
        mqttconnected = body;
    }

    //% block="On MQTT disconnect"
    //% advanced=true
    // %weight = 95
    export function OnMQTTDisconnect(body: () => void) {
        mqttEvtDConFlag = true;
        mqttdisconnected = body;
    }

    //% block="WiFi connected"
    //% advanced=true
    //% weight=100
    export function flagwificonn(): boolean {
        return FlagWiFiCon;
    }

    //% block="MQTT connected"
    //% advanced=true
    //% weight=99
    export function flagmqttconn(): boolean {
        return FlagMQTTCon;
    }
    /**
     * Execute AT command.
     * @param command AT command, eg: "AT"
     * @param waitTime Wait time after execution, eg: 1000
     */
    //% weight=97
    //% blockId="wfb_at" block="execute AT command %command and then wait %waitTime ms"
    export function executeAtCommand(command: string, waitTime: number): void {
        writeToSerial(command, waitTime)
    }
    
    /**
     * Execute HTTP method.
     * @param method HTTP method, eg: HttpMethod.GET
     * @param host Host, eg: "google.com"
     * @param port Port, eg: 80
     * @param urlPath Path, eg: "/search?q=something"
     * @param headers Headers
     * @param body Body
     */
    //% weight=96
    //% blockId="wfb_http" block="execute HTTP method %method|host: %host|port: %port|path: %urlPath||headers: %headers|body: %body"
    export function executeHttpMethod(method: HttpMethod, host: string, port: number, urlPath: string, headers?: string, body?: string): void {
        let myMethod: string
        switch (method) {
            case HttpMethod.GET: myMethod = "GET"; break;
            case HttpMethod.POST: myMethod = "POST"; break;
            case HttpMethod.PUT: myMethod = "PUT"; break;
            case HttpMethod.HEAD: myMethod = "HEAD"; break;
            case HttpMethod.DELETE: myMethod = "DELETE"; break;
            case HttpMethod.PATCH: myMethod = "PATCH"; break;
            case HttpMethod.OPTIONS: myMethod = "OPTIONS"; break;
            case HttpMethod.CONNECT: myMethod = "CONNECT"; break;
            case HttpMethod.TRACE: myMethod = "TRACE";
        }
        // Establish TCP connection:
        let data: string = "AT+CIPSTART=\"TCP\",\"" + host + "\"," + port
        writeToSerial(data, pauseBaseValue * 6)
        data = myMethod + " " + urlPath + " HTTP/1.1" + "\u000D" + "\u000A"
            + "Host: " + host + "\u000D" + "\u000A"
        if (headers && headers.length > 0) {
            data += headers + "\u000D" + "\u000A"
        }
        if (data && data.length > 0) {
            data += "\u000D" + "\u000A" + body + "\u000D" + "\u000A"
        }
        data += "\u000D" + "\u000A"
        // Send data:
        writeToSerial("AT+CIPSEND=" + (data.length + 2), pauseBaseValue * 3)
        writeToSerial(data, pauseBaseValue * 6)
        // Close TCP connection:
        writeToSerial("AT+CIPCLOSE", pauseBaseValue * 3)
    }

    //--------------------------------------- ThingSpeak ---------------------------------------

    //% block="Connect to ThingSpeak|User Name %user|Password %pwd"
    //% subcategory=ThingSpeak
    //% blockExternalInputs=true
    export function connectThingSpeak(user: string, pwd: string): void {
        connectMQTT("mqtt.thingspeak.com", 1883, "" + Math.randomRange(0, 100000000000000), user, pwd);
    }

    //% block="Send ThingSpeak|Channel ID %id|API Key %api|field1: %field1||field2: %field2 field3: %field3 field4: %field4 field5: %field5 field6: %field6 field7: %field7 field8: %field8""
    //% subcategory=ThingSpeak
    //% blockExternalInputs=true
    //% expandableArgumentMode="enabled"
    export function sendThingSpeak(id: number, api: string, field1: number, field2?: number, field3?: number, field4?: number,
        field5?: number, field6?: number, field7?: number, field8?: number): void {
        let fields: number[] = [field1, field2, field3, field4, field5, field6, field7, field8]
        let ThingSpeakTopic: string = "channels/" + id + "/publish/" + api;
        let payload: string = "";
        for (let i = 0; i < fields.length; i++) {
            payload += "field" + (i + 1) + "=" + fields[i] + "&";
        }
        payload += "status=MQTTPUBLISH";
        MQTTPub(ThingSpeakTopic, payload);
    }
}
