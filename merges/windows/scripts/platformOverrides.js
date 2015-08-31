if (!SpeechSynthesisUtterance) {
    function SpeechSynthesisUtterance(txt) {
        return {
            text: txt
        };
    };
}

(function () {
    // Append the safeHTML polyfill
    var scriptElem = document.createElement('script');
    scriptElem.setAttribute('src', 'scripts/winstore-jscompat.js');
    if (document.body) {
        document.body.appendChild(scriptElem);
    } else {
        document.head.appendChild(scriptElem);
    }

    // Use the Windows specific code for generating speech
    if (!window.speechSynthesis) {
        window.speechSynthesis = {
            speak: function (utterance) {
                var audio = new Audio();
                var synth = Windows.Media.SpeechSynthesis.SpeechSynthesizer();

                synth.synthesizeTextToStreamAsync(utterance.text).then(function (markersStream) {
                    // Convert the stream to a URL Blob.
                    var blob = MSApp.createBlobFromRandomAccessStream(markersStream.ContentType, markersStream);

                    // Send the Blob to the audio object.
                    audio.src = URL.createObjectURL(blob, { oneTimeOnly: true });
                    audio.onended = function () {
                        console.log("Done speaking... Use a promise here...");
                    };
                    audio.play();
                });
            }
        };
    }

}());