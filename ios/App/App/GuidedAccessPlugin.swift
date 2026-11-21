import Foundation
import Capacitor
import UIKit

/**
 * Exposes UIAccessibility.isGuidedAccessEnabled to the Soft Steps WebView
 * so Parent Controls can show whether Guided Access is currently on.
 */
@objc(GuidedAccessPlugin)
public class GuidedAccessPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GuidedAccessPlugin"
    public let jsName = "GuidedAccess"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isEnabled", returnType: CAPPluginReturnPromise)
    ]

    @objc func isEnabled(_ call: CAPPluginCall) {
        let enabled = UIAccessibility.isGuidedAccessEnabled
        call.resolve(["enabled": enabled])
    }
}
