(function () {

    var questions = [
        {
            title: 'איזה מטוס הוא הכי מהיר מבין השלושה?',
            a: 'עפרוני',
            b: 'אדיר',
            c: 'עפיפון',
            correct: 'b',
            category: 'מטוסי קרב'
        }
    ];

    var count = 0,
        maxQuestions = 5;


    // create the quiz button
    var enterQuizButton = document.createElement("div");
    enterQuizButton.classList.add('button', 'on-map', 'quiz');
    document.body.appendChild(enterQuizButton);

    // create the quiz inself

    enterQuizButton.addEventListener('click', function () {
        $('#quiz').css('display', 'block').animate({
            'opacity': 1
        }, 1000)

        questions = questions.sort(()=>Math.random()-.5);

        showNextQuestion();

    });

    function showNextQuestion() {
        var question = questions[count++];
        $('#quiz .title').text(question.title)
        $('#quiz .option.a').text(question.a)
        $('#quiz .option.b').text(question.b)
        $('#quiz .option.c').text(question.c)
        $('#quiz .counter .current').text(count)
        $('#quiz .counter .total').text(maxQuestions)
    }

    $('#quiz .option').on("click", function () {
        var question = questions[count-1];
        if(this.classList.contains(question.correct)) {
            this.classList.add('correct');
        } else {
            this.classList.add('wrong');
        }
    })

})()