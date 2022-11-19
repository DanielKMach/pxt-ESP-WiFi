/**
 * EXAMPLE 1: Keeping track of micro:bit's temperature.
 * 
 * Used to keep track of the temperature of a room or something near the micro:bit, but you can change 'input.temperature()' (on line 31) to whatever you want!
 * E.g. Change it to 'input.soundLevel()' to keep track of how much noise there is near the micro:bit.
 */

// Initialize serial connection to ESP
espwifi.initialize(
	SerialPin.P14,
	SerialPin.P13,
	BaudRate.BaudRate115200
)

while (!espwifi.isReady())
	basic.showString("ESP IS NOT READY")

// Connects ESP to local Wifi network
while (!espwifi.isWifiConnected()) {
	basic.showString("CONNECTION ERROR")
	espwifi.connectWifi(
		"Daniel's Wifi",
		"33669999"
	)
}

basic.showIcon(IconNames.Heart)

// Each 10 minutes, set ThingSpeak's field 1 to microbit temperature.
basic.forever(function () {
	espwifi.thingSpeakSetField(ThingSpeakField.Field1, input.temperature(), "Q09OR1JBVFVMQVRJT05T")

	if (espwifi.lastRequestSuccessful())
		basic.showIcon(IconNames.Yes)
	else
		basic.showIcon(IconNames.No)

	basic.pause(10 * 60 * 1000) // Wait 10 minutes
})