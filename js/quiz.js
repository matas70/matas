(function () {

    // create the quiz button
    var enterQuizButton = document.createElement("div");
    enterQuizButton.classList.add('button', 'on-map', 'quiz');
    document.body.appendChild(enterQuizButton);

    // create the quiz inself

    enterQuizButton.addEventListener('click', function () {
        $('#quiz').css('display', 'block').animate({
            'opacity': 1
        }, 1000)
    })

})()