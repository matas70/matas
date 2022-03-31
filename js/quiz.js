(function () {

  var questions = [
    {
      "title": "מה תפקידה של מערכת ה\"חץ\"?",
      "a": "יירוט מטוסי אויב",
      "b": "יירוט טילים ארוכי טווח",
      "c": "יירוט טילים לטווח בינוני ארוך",
      "correct": "ב",
      "category": "הגנ\"א"
    },
    {
      "title": "מהי ארץ הייצור של מטוסי הקרב של חיל-האוויר?",
      "a": "ארה\"ב",
      "b": "צרפת",
      "c": "אנגליה",
      "correct": "א",
      "category": "מטוסי קרב"
    },
    {
      "title": "מהו השם העברי של מטוס-הקרב F-15I",
      "a": "אדיר",
      "b": "סופה",
      "c": "רעם",
      "correct": "ג",
      "category": "מטוסי קרב"
    },
    {
      "title": "איזה מטוס-קרב הוא הכי ותיק בחיל-האוויר?",
      "a": "בז",
      "b": "אדיר",
      "c": "רעם",
      "correct": "א",
      "category": "מטוסי קרב"
    },
    {
      "title": "איזו יחידה מיוחדת היא חלק מהחיל?",
      "a": "שלדג",
      "b": "יהל\"ם",
      "c": "מגלן",
      "correct": "א",
      "category": "יחידות מיוחדות"
    },
    {
      "title": "מתי נוסד חיל-האוויר הישראלי?",
      "a": 1950,
      "b": 1947,
      "c": 1948,
      "correct": "ג",
      "category": "כללי"
    },
    {
      "title": "אילו מן הבאים הינו מטוס הדרכה?",
      "a": "נחשון",
      "b": "עפרוני",
      "c": "ראם",
      "correct": "ב",
      "category": "כללי"
    },
    {
      "title": "בעבר הוא נקרא מל\"ט, אך כיום...",
      "a": "כטב\"ם",
      "b": "מזל\"ט",
      "c": "כטמ\"ם",
      "correct": "ג",
      "category": "כטמ\"ם"
    },
    {
      "title": "מהו הכטמ\"ם הגדול ביותר בחיל?",
      "a": "זיק",
      "b": "איתן",
      "c": "כוכב",
      "correct": "ב",
      "category": "כטמ\"ם"
    },
    {
      "title": "כמה טייסות \"אדיר\" יש בחיל-האוויר?",
      "a": 0,
      "b": 1,
      "c": 2,
      "correct": "ג",
      "category": "מטוסי קרב"
    },
    {
      "title": "באיזה בסיס נמצא בית הספר לטיסה?",
      "a": "חצור",
      "b": "חצרים",
      "c": "פלמחים",
      "correct": "ב",
      "category": "כללי"
    },
    {
      "title": "מהו שם המבצע שפתח את מלחמת ששת הימים?",
      "a": "מבצע אופרה",
      "b": "מבצע חד וחלק",
      "c": "מבצע מוקד",
      "correct": "ג",
      "category": "מלחמות ישראל"
    },
    {
      "title": "מהו מטוס התדלוק של חיל האוויר?",
      "a": "ראם",
      "b": "שמשון",
      "c": "בז",
      "correct": "א",
      "category": "תובלה"
    },
    {
      "title": "באיזו שנה הוקמה כנף הכוחות המיוחדים של חיל האוויר?",
      "a": 1975,
      "b": 2020,
      "c": 2004,
      "correct": "ב",
      "category": "יחידות מיוחדות"
    },
    {
      "title": "מהו שמו של מפקד חיל-האוויר הנוכחי?",
      "a": "אלוף עמיקם נורקין",
      "b": "אלוף אמיר אשל",
      "c": "רב-אלוף אביב כוכבי",
      "correct": "א",
      "category": "כללי"
    },
    {
      "title": "איזו מערכת הגנ\"א הינה החדשה ביותר?",
      "a": "כיפת ברזל",
      "b": "קלע דוד",
      "c": "S-300",
      "correct": "ב",
      "category": "הגנ\"א"
    },
    {
      "title": "מהן ראשי התיבות של יב\"א?",
      "a": "יחידת בידוק ואיפוס",
      "b": "יחידת בקרה אזורית",
      "c": "יחידת בטחון אזורי",
      "correct": "ב",
      "category": "מערך הבקרה והפיקוח"
    },
    {
      "title": "באיזה בסיס נמצא המטה המבצעי של חיל-האוויר?",
      "a": "קריה",
      "b": "רמון",
      "c": "רמת דוד",
      "correct": "א",
      "category": "כללי"
    },
    {
      "title": "מי אחראי על תא המטען במסוק?",
      "a": "פקח העמסה",
      "b": "קברניט",
      "c": "מכונאי מוטס",
      "correct": "ג",
      "category": "מסוקי סער"
    },
    {
      "title": "איזה מערך בחיל-האוויר הוא בעל מספר שעות הטיסה הרב ביותר?",
      "a": "מערך הקרב",
      "b": "מערך התובלה",
      "c": "מערך הכטמ\"ם",
      "correct": "ג",
      "category": "כללי"
    },
    {
      "title": "איזו חיה מזוהה עם יחידת העילית 669?",
      "a": "חתול",
      "b": "כלב",
      "c": "נמר",
      "correct": "א",
      "category": "יחידות מיוחדות"
    },
    {
      "title": "איזו טייסת נסגרה בשנת 2020?",
      "a": 117,
      "b": 115,
      "c": 116,
      "correct": "א",
      "category": "כללי"
    },
    {
      "title": "מהו שמו הלועזי של מסוק ה\"ינשוף\"?",
      "a": "גולדן איגל",
      "b": "בלאק-הוק",
      "c": "צ'ינוק",
      "correct": "ב",
      "category": "מסוקי סער"
    },
    {
      "title": "מהי הטייסת הראשונה של החיל?",
      "a": 101,
      "b": 100,
      "c": 210,
      "correct": "ב",
      "category": "כללי"
    },
    {
      "title": "באיזו דרגה השתחרר משירות אילן רמון ז\"ל?",
      "a": "אלוף-משנה",
      "b": "תת-אלוף",
      "c": "רב-סרן",
      "correct": "א",
      "category": "כללי"
    },
    {
      "title": "מהו השם הנפוץ ביותר לטייסים בחיל?",
      "a": "עידן",
      "b": "רועי",
      "c": "גיא",
      "correct": "ב",
      "category": "כללי"
    },
    {
      "title": "כמה זנבות יש לF-15?",
      "a": 3,
      "b": 1,
      "c": 2,
      "correct": "ג",
      "category": "מטוסי קרב"
    },
    {
      "title": "כמה זמן אורך קורס-הטיס?",
      "a": "3 שנים",
      "b": "תלוי בחניך",
      "c": "שנתיים וחצי",
      "correct": "א",
      "category": "כללי"
    },
    {
      "title": "מהו השלב האחרון בקורס-הטיס?",
      "a": "יסודות",
      "b": "בסיסי",
      "c": "מתקדם",
      "correct": "ג",
      "category": "כללי"
    },
    {
      "title": "איזה מהבאים הינו מסוק קרב?",
      "a": "פתן",
      "b": "יסעור",
      "c": "ינשוף",
      "correct": "א",
      "category": "מסוקי קרב"
    },
    {
      "title": "איזה מהבאים עדיין נמצא בשירות פעיל בחיל?",
      "a": "מיראז'",
      "b": "רעם",
      "c": "סקייהוק",
      "correct": "ב",
      "category": "כללי"
    },
    {
      "title": "באיזה צבע הכומתה של חיל-האוויר?",
      "a": "אפור",
      "b": "כחול",
      "c": "שחור",
      "correct": "א",
      "category": "כללי"
    },
    {
      "title": "באיזה צבע סרבלם של טכנאי החיל?",
      "a": "לבן",
      "b": "ירוק",
      "c": "כחול",
      "correct": "ג",
      "category": "המערך הטכני"
    },
    {
      "title": "השנה, מטוסי קרב של חיל-האוויר פרסו לראשונה ל...",
      "a": "יוון",
      "b": "גרמניה",
      "c": "צרפת",
      "correct": "ב",
      "category": "כללי"
    },
    {
      "title": "היכן ממוקם הבסיס הטכני של חיל-האוויר?",
      "a": "חיפה",
      "b": "ערד",
      "c": "רחובות",
      "correct": "א",
      "category": "כללי"
    },
    {
      "title": "באיזו דרגה מסיימים בוגרי קורס-הטיס?",
      "a": "סרן",
      "b": "סגן",
      "c": "סגן-משנה",
      "correct": "ב",
      "category": "כללי"
    },
    {
      "title": "איזו טייסת משתפת פעולה עם חיל הים?",
      "a": 193,
      "b": 101,
      "c": 133,
      "correct": "א",
      "category": "מסוקי סער"
    },
    {
      "title": "מהו הבסיס הדרומי ביותר של החיל?",
      "a": "חצרים",
      "b": "רמון",
      "c": "עובדה",
      "correct": "ג",
      "category": "כללי"
    },
    {
      "title": "מהו המסוק הותיק ביותר בחיל?",
      "a": "יסעור",
      "b": "ינשוף",
      "c": "שרף",
      "correct": "א",
      "category": "מסוקי סער"
    },
    {
      "title": "באיזו שנה התרחש קרב האוויר האחרון בחיל-האוויר?",
      "a": 1973,
      "b": 1985,
      "c": 2020,
      "correct": "ב",
      "category": "מטוסי קרב"
    },
    {
      "title": "מי היה הרמטכ\"ל הראשון יוצא חיל-האוויר?",
      "a": "חיים בר-לב",
      "b": "דן חלוץ",
      "c": "דן שומרון",
      "correct": "ב",
      "category": "כללי"
    },
    {
      "title": "מהו בסיס הטיסה הראשון של חיל-האוויר?",
      "a": "עקרון",
      "b": "שדה התעופה לוד",
      "c": "שדה דב",
      "correct": "ג",
      "category": "כללי"
    },
    {
      "title": "איך קוראים ללוחם צוות-האוויר האמון על תדלוק במטוס תובלה?",
      "a": "בומר",
      "b": "נווט",
      "c": "דלקן",
      "correct": "א",
      "category": "תובלה"
    },
    {
      "title": "באיזו מלחמה חיל-האוויר הפיל יותר מטוסי אויב?",
      "a": "מלחמת העצמאות",
      "b": "מלחמת יום הכיפורים",
      "c": "מלחמת ששת הימים",
      "correct": "ב",
      "category": "מלחמות ישראל"
    },
    {
      "title": "מה היה מטוס ההדרכה הסילוני הראשון בחיל?",
      "a": "פוגה",
      "b": "צוקית",
      "c": "לביא",
      "correct": "א",
      "category": "כללי"
    }
  ];

  questions.forEach(q => q.correct = {
    'א': 'a',
    'ב': 'b',
    'ג': 'c'
  }[q.correct] || q.correct)

  questions.forEach(q => q.category = {
    "כללי": [
      'כללי',
      'כללי2',
      'כללי3'
    ],
    "מלחמות ישראל": [
      "מלחמות ישראל",
      "מלחמות ישראל2",
      "מלחמות ישראל3"
    ],
    "מטוסי קרב": [
      "מטוס קרב 1",
      "מטוסי קרב 2"
    ],
    "הגנ\"א": ["הגנא"],
    "יחידות מיוחדות": [
      "יחידות מיוחדות 1",
      "יחידות מיוחדות 2",
      "יחידות מיוחדות 3"
    ],
    "כטמ\"ם": ["כטממ"],
    "מערך הבקרה והפיקוח": ["בקרה ופיקוח"],
    "מסוקי קרב": ["מסקר"]
  }[q.category] || [q.category])

  var count = 0,
    correctCount = 0,
    maxQuestions = 5,
    disabled = false;

  // start the quiz

  $(".quiz.button, #quiz .finished .again, .new-popup .quiz").on('click', function () {

    gtag("event", "quiz_onFinishedQuiz", {
      event_category: "quiz_interaction",
    });

    if (isMenuOpen) toggleListView();

    $('#quiz').css('display', 'block').animate({
      'opacity': 1
    }, 1000)
    $('#quiz .finished').hide()

    questions = questions.sort(() => Math.random() - .5);

    showNextQuestion();

  });

  function showNextQuestion() {
    var question = questions[count++];
    disabled = false;

    $('#confetti').hide()

    $('#quiz .question .option').css({ "display": "none" })
    setTimeout(() => $('#quiz .question .option').css({ "display": "block" }), 10);

    $('#quiz .question .option.marked').removeClass('marked');
    $('#quiz .question .option.wrong').removeClass('wrong')
    $('#quiz .question .option.correct').removeClass('correct')

    $('#quiz .cover').css({
      "background-image": `url('/icons/quiz/pictures/${question.category.sort(() => Math.random() - 0.5)[0]}.jpg')`
    })

    $('#quiz .question .title').text(question.title)
    $('#quiz .question .option.a').text(question.a)
    $('#quiz .question .option.b').text(question.b)
    $('#quiz .question .option.c').text(question.c)
    $('#quiz .question .counter .current').text(count)
    $('#quiz .question .counter .total').text(maxQuestions)

    gtag("event", "quiz_onNextQuiestion", {
      event_category: "quiz_interaction",
    });
  }

  $('#quiz .question .option').on("click", function () {
    $('#quiz .question .option.marked').removeClass('marked');
    this.classList.add('marked');
  });

  $('#quiz .question .test').on("click", function () {
    if (disabled) return;
    var marked = document.querySelector('#quiz .question .option.marked')
    if (!marked) return;
    disabled = true;
    var question = questions[count - 1];

    if (marked.classList.contains(question.correct)) {
      marked.classList.add('correct');
      $('#confetti').show()
      correctCount++
    } else {
      marked.classList.add('wrong');
      $('#quiz .question .option.' + question.correct).addClass('correct')
    }
    if (count < 5) {
      setTimeout(showNextQuestion, 3000)
    } else {
      setTimeout(() => {
        $('#confetti').hide()
        $('#quiz .finished').show()
        if (correctCount < 3) {
          $('#quiz .finished').addClass('can-be-better')
          $('#quiz .finished').removeClass('almost-all-right')
        } else if (correctCount === 3 | correctCount === 4) {
          $('#quiz .finished').removeClass('can-be-better')
          $('#quiz .finished').addClass('almost-all-right')
        } else {
          $('#quiz .finished').removeClass('can-be-better')
          $('#quiz .finished').removeClass('almost-all-right')
        }
        $('#quiz .finished .correct.count').text(correctCount)
        count = correctCount = 0;
      }, 3000);
    }
  });

  $('#quiz .exit').on('click', () => {
    $('#quiz').hide();
  })

  $('#quiz .share').on('click', async () => {
    try {
      var res = await navigator.share({
        // title: `גם אני שיחקתי במטס חיל האוויר ליום העצמאות!`,
        // text: 'גם אני שיחקתי במטס חיל האוויר ליום העצמאות! חג עצמאות שמח, ובואו להתחרות איתי!',
        url: 'https://www.matas.iaf.org.il/'
      })
      console.log(res)
    } catch (err) {
      console.log('cant share', err)
    }
  });


  /* Confetti by Patrik Sv/* Confetti by Patrik Svensson (http://metervara.net) */
  // under MIT licence. credit: https://codepen.io/aptikas/pen/VwLwyXz
  $(document).ready(function () {
    var frameRate = 30;
    var dt = 1.0 / frameRate;
    var DEG_TO_RAD = Math.PI / 180;
    var RAD_TO_DEG = 180 / Math.PI;
    var colors = [
      ["#df0049", "#660671"],
      ["#00e857", "#005291"],
      ["#2bebbc", "#05798a"],
      ["#ffd200", "#b06c00"]
    ];

    function Vector2(_x, _y) {
      this.x = _x, this.y = _y;
      this.Length = function () {
        return Math.sqrt(this.SqrLength());
      }
      this.SqrLength = function () {
        return this.x * this.x + this.y * this.y;
      }
      this.Equals = function (_vec0, _vec1) {
        return _vec0.x == _vec1.x && _vec0.y == _vec1.y;
      }
      this.Add = function (_vec) {
        this.x += _vec.x;
        this.y += _vec.y;
      }
      this.Sub = function (_vec) {
        this.x -= _vec.x;
        this.y -= _vec.y;
      }
      this.Div = function (_f) {
        this.x /= _f;
        this.y /= _f;
      }
      this.Mul = function (_f) {
        this.x *= _f;
        this.y *= _f;
      }
      this.Normalize = function () {
        var sqrLen = this.SqrLength();
        if (sqrLen != 0) {
          var factor = 1.0 / Math.sqrt(sqrLen);
          this.x *= factor;
          this.y *= factor;
        }
      }
      this.Normalized = function () {
        var sqrLen = this.SqrLength();
        if (sqrLen != 0) {
          var factor = 1.0 / Math.sqrt(sqrLen);
          return new Vector2(this.x * factor, this.y * factor);
        }
        return new Vector2(0, 0);
      }
    }
    Vector2.Lerp = function (_vec0, _vec1, _t) {
      return new Vector2((_vec1.x - _vec0.x) * _t + _vec0.x, (_vec1.y - _vec0.y) * _t + _vec0.y);
    }
    Vector2.Distance = function (_vec0, _vec1) {
      return Math.sqrt(Vector2.SqrDistance(_vec0, _vec1));
    }
    Vector2.SqrDistance = function (_vec0, _vec1) {
      var x = _vec0.x - _vec1.x;
      var y = _vec0.y - _vec1.y;
      return (x * x + y * y + z * z);
    }
    Vector2.Scale = function (_vec0, _vec1) {
      return new Vector2(_vec0.x * _vec1.x, _vec0.y * _vec1.y);
    }
    Vector2.Min = function (_vec0, _vec1) {
      return new Vector2(Math.min(_vec0.x, _vec1.x), Math.min(_vec0.y, _vec1.y));
    }
    Vector2.Max = function (_vec0, _vec1) {
      return new Vector2(Math.max(_vec0.x, _vec1.x), Math.max(_vec0.y, _vec1.y));
    }
    Vector2.ClampMagnitude = function (_vec0, _len) {
      var vecNorm = _vec0.Normalized;
      return new Vector2(vecNorm.x * _len, vecNorm.y * _len);
    }
    Vector2.Sub = function (_vec0, _vec1) {
      return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y, _vec0.z - _vec1.z);
    }

    function EulerMass(_x, _y, _mass, _drag) {
      this.position = new Vector2(_x, _y);
      this.mass = _mass;
      this.drag = _drag;
      this.force = new Vector2(0, 0);
      this.velocity = new Vector2(0, 0);
      this.AddForce = function (_f) {
        this.force.Add(_f);
      }
      this.Integrate = function (_dt) {
        var acc = this.CurrentForce(this.position);
        acc.Div(this.mass);
        var posDelta = new Vector2(this.velocity.x, this.velocity.y);
        posDelta.Mul(_dt);
        this.position.Add(posDelta);
        acc.Mul(_dt);
        this.velocity.Add(acc);
        this.force = new Vector2(0, 0);
      }
      this.CurrentForce = function (_pos, _vel) {
        var totalForce = new Vector2(this.force.x, this.force.y);
        var speed = this.velocity.Length();
        var dragVel = new Vector2(this.velocity.x, this.velocity.y);
        dragVel.Mul(this.drag * this.mass * speed);
        totalForce.Sub(dragVel);
        return totalForce;
      }
    }

    function ConfettiPaper(_x, _y) {
      this.pos = new Vector2(_x, _y);
      this.rotationSpeed = Math.random() * 600 + 800;
      this.angle = DEG_TO_RAD * Math.random() * 360;
      this.rotation = DEG_TO_RAD * Math.random() * 360;
      this.cosA = 1.0;
      this.size = 5;
      this.oscillationSpeed = Math.random() * 1.5 + 0.5;
      this.xSpeed = 40.0;
      this.ySpeed = Math.random() * 60 + 70.0;
      this.corners = new Array();
      this.time = Math.random();
      var ci = Math.round(Math.random() * (colors.length - 1));
      this.frontColor = colors[ci][0];
      this.backColor = colors[ci][1];
      for (var i = 0; i < 4; i++) {
        var dx = Math.cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
        var dy = Math.sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
        this.corners[i] = new Vector2(dx, dy);
      }
      this.Update = function (_dt) {
        this.time += _dt;
        this.rotation += this.rotationSpeed * _dt;
        this.cosA = Math.cos(DEG_TO_RAD * this.rotation);
        this.pos.x += Math.cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt
        this.pos.y += this.ySpeed * _dt;
        if (this.pos.y > ConfettiPaper.bounds.y) {
          this.pos.x = Math.random() * ConfettiPaper.bounds.x;
          this.pos.y = 0;
        }
      }
      this.Draw = function (_g) {
        if (this.cosA > 0) {
          _g.fillStyle = this.frontColor;
        } else {
          _g.fillStyle = this.backColor;
        }
        _g.beginPath();
        _g.moveTo(this.pos.x + this.corners[0].x * this.size, this.pos.y + this.corners[0].y * this.size * this.cosA);
        for (var i = 1; i < 4; i++) {
          _g.lineTo(this.pos.x + this.corners[i].x * this.size, this.pos.y + this.corners[i].y * this.size * this.cosA);
        }
        _g.closePath();
        _g.fill();
      }
    }
    ConfettiPaper.bounds = new Vector2(0, 0);

    function ConfettiRibbon(_x, _y, _count, _dist, _thickness, _angle, _mass, _drag) {
      this.particleDist = _dist;
      this.particleCount = _count;
      this.particleMass = _mass;
      this.particleDrag = _drag;
      this.particles = new Array();
      var ci = Math.round(Math.random() * (colors.length - 1));
      this.frontColor = colors[ci][0];
      this.backColor = colors[ci][1];
      this.xOff = Math.cos(DEG_TO_RAD * _angle) * _thickness;
      this.yOff = Math.sin(DEG_TO_RAD * _angle) * _thickness;
      this.position = new Vector2(_x, _y);
      this.prevPosition = new Vector2(_x, _y);
      this.velocityInherit = Math.random() * 2 + 4;
      this.time = Math.random() * 100;
      this.oscillationSpeed = Math.random() * 2 + 2;
      this.oscillationDistance = Math.random() * 40 + 40;
      this.ySpeed = Math.random() * 40 + 80;
      for (var i = 0; i < this.particleCount; i++) {
        this.particles[i] = new EulerMass(_x, _y - i * this.particleDist, this.particleMass, this.particleDrag);
      }
      this.Update = function (_dt) {
        var i = 0;
        this.time += _dt * this.oscillationSpeed;
        this.position.y += this.ySpeed * _dt;
        this.position.x += Math.cos(this.time) * this.oscillationDistance * _dt;
        this.particles[0].position = this.position;
        var dX = this.prevPosition.x - this.position.x;
        var dY = this.prevPosition.y - this.position.y;
        var delta = Math.sqrt(dX * dX + dY * dY);
        this.prevPosition = new Vector2(this.position.x, this.position.y);
        for (i = 1; i < this.particleCount; i++) {
          var dirP = Vector2.Sub(this.particles[i - 1].position, this.particles[i].position);
          dirP.Normalize();
          dirP.Mul((delta / _dt) * this.velocityInherit);
          this.particles[i].AddForce(dirP);
        }
        for (i = 1; i < this.particleCount; i++) {
          this.particles[i].Integrate(_dt);
        }
        for (i = 1; i < this.particleCount; i++) {
          var rp2 = new Vector2(this.particles[i].position.x, this.particles[i].position.y);
          rp2.Sub(this.particles[i - 1].position);
          rp2.Normalize();
          rp2.Mul(this.particleDist);
          rp2.Add(this.particles[i - 1].position);
          this.particles[i].position = rp2;
        }
        if (this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount) {
          this.Reset();
        }
      }
      this.Reset = function () {
        this.position.y = -Math.random() * ConfettiRibbon.bounds.y;
        this.position.x = Math.random() * ConfettiRibbon.bounds.x;
        this.prevPosition = new Vector2(this.position.x, this.position.y);
        this.velocityInherit = Math.random() * 2 + 4;
        this.time = Math.random() * 100;
        this.oscillationSpeed = Math.random() * 2.0 + 1.5;
        this.oscillationDistance = Math.random() * 40 + 40;
        this.ySpeed = Math.random() * 40 + 80;
        var ci = Math.round(Math.random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        this.particles = new Array();
        for (var i = 0; i < this.particleCount; i++) {
          this.particles[i] = new EulerMass(this.position.x, this.position.y - i * this.particleDist, this.particleMass, this.particleDrag);
        }
      }
      this.Draw = function (_g) {
        for (var i = 0; i < this.particleCount - 1; i++) {
          var p0 = new Vector2(this.particles[i].position.x + this.xOff, this.particles[i].position.y + this.yOff);
          var p1 = new Vector2(this.particles[i + 1].position.x + this.xOff, this.particles[i + 1].position.y + this.yOff);
          if (this.Side(this.particles[i].position.x, this.particles[i].position.y, this.particles[i + 1].position.x, this.particles[i + 1].position.y, p1.x, p1.y) < 0) {
            _g.fillStyle = this.frontColor;
            _g.strokeStyle = this.frontColor;
          } else {
            _g.fillStyle = this.backColor;
            _g.strokeStyle = this.backColor;
          }
          if (i == 0) {
            _g.beginPath();
            _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
            _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
            _g.lineTo((this.particles[i + 1].position.x + p1.x) * 0.5, (this.particles[i + 1].position.y + p1.y) * 0.5);
            _g.closePath();
            _g.stroke();
            _g.fill();
            _g.beginPath();
            _g.moveTo(p1.x, p1.y);
            _g.lineTo(p0.x, p0.y);
            _g.lineTo((this.particles[i + 1].position.x + p1.x) * 0.5, (this.particles[i + 1].position.y + p1.y) * 0.5);
            _g.closePath();
            _g.stroke();
            _g.fill();
          } else if (i == this.particleCount - 2) {
            _g.beginPath();
            _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
            _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
            _g.lineTo((this.particles[i].position.x + p0.x) * 0.5, (this.particles[i].position.y + p0.y) * 0.5);
            _g.closePath();
            _g.stroke();
            _g.fill();
            _g.beginPath();
            _g.moveTo(p1.x, p1.y);
            _g.lineTo(p0.x, p0.y);
            _g.lineTo((this.particles[i].position.x + p0.x) * 0.5, (this.particles[i].position.y + p0.y) * 0.5);
            _g.closePath();
            _g.stroke();
            _g.fill();
          } else {
            _g.beginPath();
            _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
            _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
            _g.lineTo(p1.x, p1.y);
            _g.lineTo(p0.x, p0.y);
            _g.closePath();
            _g.stroke();
            _g.fill();
          }
        }
      }
      this.Side = function (x1, y1, x2, y2, x3, y3) {
        return ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2));
      }
    }
    ConfettiRibbon.bounds = new Vector2(0, 0);
    confetti = {};
    confetti.Context = function (parent) {
      var i = 0;
      var canvasParent = document.getElementById(parent);
      var canvas = document.createElement('canvas');
      //canvas.width = canvasParent.offsetWidth;
      //canvas.height = canvasParent.offsetHeight;
      canvas.width = window.screen.width
      canvas.height = window.screen.height
      canvasParent.appendChild(canvas);
      var context = canvas.getContext('2d');
      var interval = null;
      var confettiRibbonCount = 7;
      var rpCount = 15;
      var rpDist = 8.0;
      var rpThick = 5.0;
      var confettiRibbons = new Array();
      ConfettiRibbon.bounds = new Vector2(canvas.width, canvas.height);
      for (i = 0; i < confettiRibbonCount; i++) {
        confettiRibbons[i] = new ConfettiRibbon(Math.random() * canvas.width, -Math.random() * canvas.height * 2, rpCount, rpDist, rpThick, 45, 1, 0.05);
      }
      var confettiPaperCount = 40;
      var confettiPapers = new Array();
      ConfettiPaper.bounds = new Vector2(canvas.width, canvas.height);
      for (i = 0; i < confettiPaperCount; i++) {
        confettiPapers[i] = new ConfettiPaper(Math.random() * canvas.width, Math.random() * canvas.height);
      }
      this.resize = function () {
        //canvas.width = canvasParent.offsetWidth;
        //canvas.height = canvasParent.offsetHeight;
        ConfettiPaper.bounds = new Vector2(canvas.width, canvas.height);
        ConfettiRibbon.bounds = new Vector2(canvas.width, canvas.height);
      }
      this.start = function () {
        this.stop()
        var context = this
        this.interval = setInterval(function () {
          confetti.update();
        }, 1000.0 / frameRate)
      }
      this.stop = function () {
        clearInterval(this.interval);
      }
      this.update = function () {
        var i = 0;
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (i = 0; i < confettiPaperCount; i++) {
          confettiPapers[i].Update(dt);
          confettiPapers[i].Draw(context);
        }
        for (i = 0; i < confettiRibbonCount; i++) {
          confettiRibbons[i].Update(dt);
          confettiRibbons[i].Draw(context);
        }
      }
    }
    var confetti = new confetti.Context('confetti');
    confetti.start();
    $(window).resize(function () {
      confetti.resize();
    });
  });


})()
