/**
 * MakeCode extension for ESP Wifi modules using AT commands
 */
//% color=#009b5b icon="\uf1eb" block="ESP Wi-Fi"
namespace espwifi {

	const CRLF = "\r\n"

	let response = ""
	let request_response = ""
	let request_successful = false

	/**
	 * Initializes serial conection to ESP
	 */
	//% block="initialize ESP|TX: %tx|RX: %rx|baud rate: %baudrate"
	//% tx.defl=SerialPin.P0 rx.defl=SerialPin.P1 baudrate.defl=115200
	//% weight=100
	export function initialize(tx: SerialPin, rx: SerialPin, baudrate: BaudRate) {
		serial.redirect(tx, rx, baudrate)
		basic.pause(1000)
	}

	/**
	 * Connects to the wifi with the given name and password
	 */
	//% block="connect to the Wi-Fi %name with the password %password"
	//% name.defl="wifi name" password.defl="wifi password"
	//% weight=80
	export function connectWifi(name: string, password: string) {
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
	//% block="make request to %ip %args"
	//% ip.defl="api.thingspeak.com" args.defl="/update?api_key=[your_write_key]%field1=69"
	//% weight=70
	export function request(ip: string, args: string) {

		// Start connection to the IP
		let connected_to_server = sendAT(`CIPSTART="TCP","${ip}",80`)

		if (!connected_to_server)
			return

		// Build and send request
		const request = "GET " + args + CRLF
		sendAT("CIPSEND=" + request.length) // Define requets length
		basic.pause(500)

		serial.writeString(request) // Send request
		waitResponse()

		request_response = response.trim()
		request_successful = request_response.includes("SEND OK")

		sendAT("CIPCLOSE") // Closes connection
	}

	// write AT command with CR+LF (\r\n) ending
	function sendAT(at?: string): boolean {
		if (at != undefined)
			serial.writeString("AT+" + at + CRLF)
		else
			serial.writeString("AT" + CRLF)

		return waitResponse()
	}

	function waitResponse(): boolean {
		response = ""
		const time = input.runningTime()

		while (input.runningTime() - time < 30000) { // 30 sec time out
			response += serial.readString()
			const lines = response.trim().split(CRLF)

			for (let line of lines) {
				line = line.trim()
				if (line.length == 0) continue

				if (line == "OK" || line == "CLOSED") {
					music.playTone(700, 100)
					return true
				}

				if (line == "ERROR") {
					music.playTone(200, 100)
					return false
				}
			}
		}
		return false
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
		if (!request_response.includes("+IPD")) return ""

		const start = request_response.indexOf(':') + 1
		const end = request_response.length - 6
		let data = request_response.slice(start, end)
		data = data.trim()
		return data
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
	 * Is ESP ready to use?
	 */
	//% block="ESP ready"
	//% weight=90
	export function isReady(): boolean {
		return sendAT()
	}
}