espwifi.initialize(
	SerialPin.P0,
	SerialPin.P1,
	BaudRate.BaudRate115200
)

if (!espwifi.isReady())
	basic.showString("NOT READY")

if (!espwifi.isWifiConnected()) {
	espwifi.connectWifi(
		"[your wifi name]",
		"[your wifi password]"
	)
	if (!espwifi.isWifiConnected())
		basic.showString("CONNECTION ERROR")
}

basic.forever(function () {
	espwifi.request("api.thingspeak.com", "/update?api_key=[your_write_key]%field1=" + input.temperature())
	basic.showIcon(espwifi.lastRequestSuccessful() ? IconNames.Yes : IconNames.No)
	basic.pause(60 * 60 * 1000)
})
