/**
 * EXAMPLE 2: Activate IFTTT event if micro:bit detects movement.
 * 
 * IFTTT events can basically be linked to whatever you want! But in this example I linked the event to a bot that sends me a Discord message.
 * You can attach the micro:bit onto your door to have a very basic security system! Once someone opens the door, micro:bit will trigger the IFTTT event.
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

// Once it detects motion, trigger IFTTT event called 'microbit_alarm'
input.onGesture(Gesture.ThreeG, () => {

	basic.showIcon(IconNames.Angry)
	espwifi.iftttTrigger("microbit_alarm", "V0hZUlVSRUFESU5H") // Trigger IFTTT event

	// Show 'v' if request was successful, otherwise show 'x'
	if (espwifi.lastRequestSuccessful())
		basic.showIcon(IconNames.Yes)
	else
		basic.showIcon(IconNames.No)

	basic.showIcon(IconNames.Heart)
})