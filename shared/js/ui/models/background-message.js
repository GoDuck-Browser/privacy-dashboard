/* eslint-disable @typescript-eslint/no-this-alias */
import $ from 'jquery'
import Parent from '../base/model.js'
import browserUIWrapper from '../../browser/communication.js'

/**
 * Background messaging is done via two methods:
 *
 * 1. Passive messages from background -> backgroundMessage model -> subscribing model
 *
 *  The background sends these messages using chrome.runtime.sendMessage({'name': 'value'})
 *  The backgroundMessage model (here) receives the message and forwards the
 *  it to the global event store via model.send(msg)
 *  Other modules that are subscribed to state changes in backgroundMessage are notified
 *
 * 2. Two-way messaging using this.model.fetch() as a passthrough
 *
 *  Each model can use a fetch method to send and receive a response from the background.
 *  Ex: this.model.fetch({'name': 'value'}).then((response) => console.log(response))
 *  Listeners must be registered in the background to respond to messages with this 'name'.
 *
 *  The common fetch method is defined in base/model.js
 *  @this {any}
 */
function BackgroundMessage(attrs) {
    Parent.call(this, attrs)
    const thisModel = this
    thisModel.send = new Proxy(thisModel.send, {
        apply(target, thisArg, argArray) {
            // console.log('🤒 channel.send...', JSON.stringify(argArray))
            return Reflect.apply(target, thisArg, argArray)
        },
    })
    browserUIWrapper.backgroundMessage(thisModel)
}

BackgroundMessage.prototype = $.extend({}, Parent.prototype, {
    modelName: 'backgroundMessage',
})

export default BackgroundMessage
