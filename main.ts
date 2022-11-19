enum ThingSpeakField {
	//% block="1"
	Field1 = 1,
	//% block="2"
	Field2 = 2,
	//% block="3"
	Field3 = 3,
	//% block="4"
	Field4 = 4,
	//% block="5"
	Field5 = 5,
	//% block="6"
	Field6 = 6,
	//% block="7"
	Field7 = 7,
	//% block="8"
	Field8 = 8
}

/**
 * MakeCode extension for ESP Wifi modules using AT commands
 */
//% color=#203030 icon="\uf1eb" block="ESP Wi-Fi"
namespace espwifi {

	const CRLF = "\r\n"

	let response = ""
	let request_response = ""
	let request_successful = false

	let debug = false


	// write AT command with CR+LF (\r\n) ending
	function sendAT(at?: string, waitfor?: string): boolean {
		
		response = ""
		const time = input.runningTime()

		if (at) serial.writeString("AT+" + at + CRLF)
		else serial.writeString("AT" + CRLF)

		while (input.runningTime() - time < 30000) { // 30 sec time out

			response += serial.readString()
			const lines = response.trim().split(CRLF)

			const status = lines[lines.length - 1].trim() // Last line from AT response
			if (status == "OK")
				return true
			
			if (status == "ERROR")
				return false
			
			if (waitfor && status == waitfor)
				return true
			
		}
		return false
	}


	/**
	 * Initializes serial conection to ESP
	 */
	//% block="initialize ESP|TX: %tx|RX: %rx|baud rate: %baudrate"
	//% tx.defl=SerialPin.P0 rx.defl=SerialPin.P1 baudrate.defl=115200
	//% weight=100
	export function initialize(tx: SerialPin, rx: SerialPin, baudrate: BaudRate, debug_mode: boolean = false) {
		debug = debug_mode

		serial.redirect(tx, rx, baudrate)
		basic.pause(1000)
	}

	/**
	 * Connects to the wifi with the given name and password
	 */
	//% block="connect to the Wi-Fi %name|with the password %password"
	//% name.defl="wifi name" password.defl="wifi password"
	//% weight=80
	export function connectWifi(name: string, password: string) {
		if (!name || !password) return

		sendAT("CWMODE=1") // set to station mode
		basic.pause(500)
		sendAT(`CWJAP="${name}","${password}"`)
	}

	//% block="disconnect from the Wi-Fi"
	//% weight=75
	export function disconnectWifi() {
		sendAT("CWQAP")
	}

	/**
	 * Make a GET request with the ESP
	 */
	//% block="make GET request %url to %ip"
	//% ip.defl="api.thingspeak.com" url.defl="https://api.thingspeak.com/update?api_key=[key]&field1=69"
	//% weight=70
	export function request(url: string, ip: string) {
		if (!url || !ip) return

		request_successful = false

		// Start connection to the IP
		let connected = sendAT(`CIPSTART="TCP","${ip}",80`)

		if (!connected)
			return

		// Build and send request
		const request = `GET ${url} HTTP/1.1` + CRLF
			+ `Host: ${ip}` + CRLF + CRLF

		sendAT("CIPSEND=" + request.length, '>') // Define requets length

		serial.writeString(request) // Send request

		// Read response and parse it
		const now = input.runningTime()
		request_response = ""
		while (input.runningTime() - now < 3000) {
			request_response += serial.readString()
		}
		request_response = request_response.trim()

		const response_array = request_response.split(CRLF + CRLF)
		request_successful = request_response.includes("SEND OK")
		request_response = response_array[response_array.length - 1].trim()

		sendAT("CIPCLOSE") // Close connection
	}

	/**
	 * Restore ESP to factory default settings
	 */
	//% block="restore ESP to factory default"
	//% weight=11
	export function restoreFactoryDefault() {
		sendAT("RESTORE") // restore to factory default settings
		basic.pause(1000)
	}

	/**
	 * Restart ESP
	 */
	//% block="restart ESP"
	//% weight=12
	export function restart() {
		sendAT("RST")
		basic.pause(1000)
	}

	/**
	 * Retrieves the data form the last request
	 */
	//% block="data from last request"
	//% weight=61
	export function dataFromLastRequest(): string {
		if (!lastRequestSuccessful()) return ""
		return request_response
	}

	/**
	 * Is ESP connected to the Wi-Fi AP?
	 */
	//% block="ESP connected to Wi-Fi"
	//% weight=72
	export function isWifiConnected(): boolean {
		sendAT("CWJAP?")
		return response.includes("+CWJAP:")
	}

	/**
	 * Returns the name of the ESP's connected Wi-Fi
	 */
	//% block="ESP connected Wi-Fi name"
	//% weight=71
	export function connectedWifiName(): string {
		if (!isWifiConnected()) return ""

		const start = response.indexOf('"') + 1
		const end = response.indexOf('"', start)
		return response.slice(start, end)
	}

	/**
	 * Was last request sent successful?
	 */
	//% block="last request successful"
	//% weight=62
	export function lastRequestSuccessful(): boolean {
		return request_successful
	}

	/**
	 * Is ESP present and ready to use?
	 */
	//% block="ESP is present"
	//% weight=90
	export function isReady(): boolean {
		return sendAT()
	}

	//% block="set ThingSpeak fields using key %key|field 1 to %field1|field 2 to %field2|field 3 to %field3|field 4 to %field4|field 5 to %field5|field 6 to %field6|field 7 to %field7|field 8 to %field8"
	//% group="ThingSpeak" advanced=true weight=99
	export function thingSpeakSetFields(key: string, field1: number = 0, field2: number = 0, field3: number = 0, field4: number = 0, field5: number = 0, field6: number = 0, field7: number = 0, field8: number = 0) {
		if (!key) return

		request(`https://api.thingspeak.com/update?api_key=${key}&field1=${field1}&field2=${field2}&field3=${field3}&field4=${field4}&field5=${field5}&field6=${field6}&field7=${field7}&field8=${field8}`, "api.thingspeak.com")
	}

	//% block="set ThingSpeak field %field to %value using key %key"
	//% field.defl=1
	//% group="ThingSpeak" advanced=true weight=100
	export function thingSpeakSetField(field: number, value: number, key: string) {
		if (!field || !key) return

		request(`https://api.thingspeak.com/update?api_key=${key}&field${field}=${value}`, "api.thingspeak.com")
	}

	//% block="get ThingSpeak field %field using key %key"
	//% field.defl=1
	//% group="ThingSpeak" advanced=true weight=90
	export function thingSpeakGetField(field: number, key: string) {
		if (!field || !key) return undefined

		request(`https://api.thingspeak.com/channels/1832722/fields/${field}/last.txt?api_key=${key}`, "api.thingspeak.com")

		return lastRequestSuccessful() ? parseInt(dataFromLastRequest()) : undefined
	}


	//% block="trigger IFTTT Webhook event %event using key %key"
	//% event.delf="event name"
	//% group="IFTTT" advanced=true weight=100
	export function iftttTrigger(event: string, key: string) {
		if (!event || !key) return

		request(`https://maker.ifttt.com/trigger/${event}/with/key/${key}`, "maker.ifttt.com")
	}

	//% block="trigger IFTTT Webhook event %event using key %key|value 1 as %value1|value 2 as %value2|value 3 as %value3"
	//% event.delf="event name"
	//% group="IFTTT" advanced=true weight=99
	export function iftttTriggerValues(event: string, key: string, value1: number = 0, value2: number = 0, value3: number = 0) {
		if (!event || !key) return

		request(`https://maker.ifttt.com/trigger/${event}/with/key/${key}?value1=${value1}&value2=${value2}&value3=${value3}`, "maker.ifttt.com")
	}
}