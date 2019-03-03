$(document).ready(function() {

    Webcam.set({
			width: 400,
			height: 300,
			image_format: 'jpeg',
			jpeg_quality: 90
    });
    Webcam.attach( '#my_camera' );

    function take_snapshot_for_text() {
        // take snapshot and get image data
        Webcam.snap( function(data_uri) {
            // display results in page
//            document.getElementById('results').innerHTML =
//                '<h2>Here is your image:</h2>' +
//                '<img src="'+data_uri+'"/>';
//            console.log(data_uri);


            $.ajax({
                type: "GET",
                url: $SCRIPT_ROOT + '/text',
                data: {"data_uri": data_uri},
//                dataType: 'json',
                success: function(data) {
                    var data_ = data.split('@');
                    $('.result_img').attr("src", "data:image/png;base64," + data_[0]);
                    $(".translation_english").text(data_[1]);
                },
                error: function(request, status, error){
                    console.log(error)
                    alert("No text detected! Please try again!")
                }
            });
        })
    }

    function take_snapshot_for_object() {
        // take snapshot and get image data
        Webcam.snap( function(data_uri) {

            $.ajax({
                type: "GET",
                url: $SCRIPT_ROOT + '/object',
                data: {"data_uri": data_uri},
                success: function(data) {
                    var data_ = data.split('@');
                    $('.result_img').attr("src", "data:image/png;base64," + data_[0]);
                    $(".translation_english").text(data_[1]);
                },
                error: function(request, status, error){
                    console.log(error)
                }
            });
        })
    }

    var history_table = $('table#history_table').DataTable({
            'responsive': true,
            "autoWidth": true,
            dom: 'Bfrtip',
//            buttons: [
//                'copy', 'csv', 'excel', 'pdf', 'print'
//            ],
            columns:
            [
                {
                    title: "Word",
                    data: 0,
                },
                {
                    title: "Translation",
                    data: 1
                }
            ]
        });

    // Language options
    var isoCountries = [
        { id: 'zh', text: 'Chinese', cty: "CN"},
        { id: 'ja', text: 'Japanese', cty: "JP"},
        { id: 'es', text: 'Spanish', cty: "ES"},
        { id: 'fr', text: 'French', cty: "FR"},
        { id: 'ko', text: 'Korean', cty: "KR"},
    ]
    // Get flash for each country
    function formatCountry (country) {
        if (!country.cty) { return country.text; }
        var $country = $(
        '<span class="flag-icon flag-icon-'+ country.cty.toLowerCase() +' flag-icon"></span>' +
        '<span class="flag-text">'+ country.text+"</span>"
        );
        return $country;
    };

    // Select language option
    var s2 = $(".languages").select2({
        templateResult: formatCountry,
        data: isoCountries
    });

    // Select all options as default
    var selectedItems = [];
    var allOptions = $(".languages option");
    allOptions.each(function() {
        selectedItems.push( $(this).val() );
    });
    s2.val(selectedItems).trigger("change");



     $("#text_recog").bind('click', function() {
        $(".translate-output").show()
        take_snapshot_for_text();
    });

    $("#object_detect").bind('click', function() {
        $(".translate-output").show()
        take_snapshot_for_object();
    })


    $('p.translation_english').bind("DOMSubtreeModified",function(){
        var word = $(this).text();
        var langs = $('.languages').val();
        translation(word, langs)
//        console.log(langs);
    });


    var CountriesDict = {
        'zh': 'Chinese',
        'ja': 'Japanese',
        'es': 'Spanish',
        'fr': 'French',
        'ko': 'Korean'
    }

    var CountriesVoice = {
        'english': 'en-US',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'ko': 'ko-KR'
    }

    function translation(word, langs){
        var base_url = "https://translate.yandex.net/api/v1.5/tr.json/translate?"
        var key = 'key=' + "trnsl.1.1.20190302T221501Z.db0a8355be3caec7.473bf490f3317210f75eff2f74de67bd788dc48e"
        var text = "text=" + word

        var requests = [];
        $.each(langs, function(index, lang) {
            requests.push(get_translated_data(word, lang))
        })
        $.when.apply($,requests).done(function(){
            var total = [];
            $.each(arguments, function (i, data) {
                total.push(data[0]['text']); //if the result of the ajax request is a int value then
                var lang = data[0]['lang'].split('-')[1];
                $(".translation_" + lang).text(data[0]['text']);
            });
//            console.log(total)
            history_table.row.add([word, total.join(", ")]).draw();
        })
    }


    function get_translated_data(word, lang) {
        var base_url = "https://translate.yandex.net/api/v1.5/tr.json/translate?"
        var key = 'key=' + "trnsl.1.1.20190302T221501Z.db0a8355be3caec7.473bf490f3317210f75eff2f74de67bd788dc48e"
        var text = "text=" + word
        var lang_str = "lang=en-" + lang
        var url = base_url + key + "&" + text + "&" + lang_str
        return $.ajax({
                type: "GET",
                dataType: 'json',
                url: url
        });
    }



    // Word pronunciation
    $('a.audio').click(function() {
        var item_id = $(this).attr('id')
        var lang = item_id.split('_')[2];

        var text = $(".translation_" + lang).text();
        var lang_code = CountriesVoice[lang]

        var msg = new SpeechSynthesisUtterance(text);
        msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.lang == lang_code; })[0];
        speechSynthesis.speak(msg);
    })



//        $.ajax({
//            type: "GET",
//            url: url,
//            dataType: 'json',
//            complete : function(){
//            },
//            success: function(data){
//                translated_word = data['text'][0];
//                $(".translation_ch").text(translated_word);
//
//            }
//        });





    // Get translation



//    $('#form').on('submit', function(e){
////        e.preventDefault();
//        $.ajax({
//            url: 'http://127.0.0.1:5000/square/',
//            data: {'number': number},
//            method: 'POST',
//            success: function(data) {
//                $('#num').val('');
//                $('#square').html('Square of ' + number + ' is ' + data['square'])
//            }
//        });
//    });

//    navigator.getUserMedia = ( navigator.getUserMedia ||
//    navigator.webkitGetUserMedia ||
//    navigator.mozGetUserMedia ||
//    navigator.msGetUserMedia);
//
//
//    var webcamStream;
//
//    var localMediaStream;
//
//    var video = document.querySelector("#videoElement");
//
//    function startWebcam() {
//        if (navigator.getUserMedia) {
//            navigator.getUserMedia ({
//                video: true,
//                audio: false
//            },
//            // successCallback
//            onUserMediaSuccess = function(localMediaStream) {
//                video.srcObject = localMediaStream;
//                webcamStream = localMediaStream;
//            },
//            // errorCallback
//            function(err) {
//                console.log("The following error occured: " + err);
//            });
//        } else {
//            console.log("getUserMedia not supported");
//        }
//    }
//
//    function stopWebcam() {
//        video.pause();
//        webcamStream.getVideoTracks()[0].stop();
//    }
//
//    $(".start").on('click', function() {
//        startWebcam();
//    })
//
//    $(".stop").on('click', function() {
//        stopWebcam();
//    })
//
//    //---------------------
//    // TAKE A SNAPSHOT CODE
//    //---------------------
//    var canvas;
//    var ctx;
//
//    function snapshot() {
//        const canvas = document.getElementById("videoElement");
//        const ctx = canvas.getContext('2d');
//        // Draws current image from the video element into the canvas
//        ctx.drawImage(video, 0,0, canvas.width, canvas.height);
//        ctx.drawImage(vid, 0,0); // the video
//        return new Promise((res, rej)=>{
//        canvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
//        });
//    }
//
//    $(".snapshot").on('click', function() {
//        console.log("here");
//        takeASnap()
//        .then(download);
//        stopWebcam();
//
////        $.ajax({
////            url: 'http://127.0.0.1:5000/img_feed/',
////            data: {'number': number},
////            method: 'POST',
////            success: function(data) {
////                $('#num').val('');
////                $('#square').html('Square of ' + number + ' is ' + data['square'])
////            }
////        });
//    })
//
//
//    function takeASnap(){
//        const canvas = document.createElement('canvas'); // create a canvas
//        const ctx = canvas.getContext('2d'); // get its context
//        canvas.width = video.videoWidth; // set its size to the one of the video
//        canvas.height = video.videoHeight;
//        ctx.drawImage(video, 0,0); // the video
////        var dataURL = canvas.toDataURL('image/jpeg', 1.0);
////        document.querySelector('#dl-btn').href = dataURL;
//
////        console.log(dataURL)
//      return new Promise((res, rej)=>{
//        canvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
//      });
//    }
//    function download(blob){
//        // uses the <a download> to download a Blob
//        let a = document.createElement('a');
//        a.href = URL.createObjectURL(blob);
//        a.download = 'screenshot.jpg';
//        document.body.appendChild(a);
//    }



})

