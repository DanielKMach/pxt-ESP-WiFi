basic.showIcon(IconNames.Diamond, 0)
espwifi.initialize(
	SerialPin.P14,
	SerialPin.P13,
	115200,
	true
)
basic.showIcon(espwifi.isReady() ? IconNames.SmallHeart : IconNames.Sad, 0)

if (!espwifi.isWifiConnected()) {
	espwifi.connectWifi(
		"your wifi name",
		"your wifi password"
	)
}

basic.showIcon(IconNames.Heart)

// Set ThingSpeak's field 1 to a random number if button A is pressed
input.onButtonPressed(Button.A, () => {
	basic.showArrow(ArrowNames.North, 0)
	espwifi.thingSpeakSetField(ThingSpeakField.Field1, Math.randomRange(1, 100), "your write key")

	basic.showIcon(espwifi.lastRequestSuccessful() ? IconNames.Yes : IconNames.No, 0)
})

// Show ThingSpeak's field 1 latest value if button B is pressed
input.onButtonPressed(Button.B, () => {
	basic.showArrow(ArrowNames.South, 0)
	const value = espwifi.thingSpeakGetField(ThingSpeakField.Field1, "your read key")

	if (espwifi.lastRequestSuccessful())
		basic.showString(value.toString())

	basic.showIcon(espwifi.lastRequestSuccessful() ? IconNames.Yes : IconNames.No, 500)
})