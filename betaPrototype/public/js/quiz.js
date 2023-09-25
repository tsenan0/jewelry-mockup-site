
var quizQuestions = [
    {question: "Q1. Which outfit are you most likely to wear on a day off?", answers: ["A. A white T-shirt and jeans", "B. A vintage dress", "C. A high-fashion runway ensemble", "D. Comfortable activewear"]},
    {question: "Q2. How would you describe your style?", answers: ["A. Minimalistic and comfortable", "B. Vintage with a touch of glamor", "C. Unique and avant-garde", "D. Sporty and casual"]},
    {question: "Q3. What type of metal do you prefer in your jewelry?", answers: ["A. Silver", "B. Gold", "C. White Gold/Platinum", "D. No preference"]},
    {question: "Q4. When it comes to jewelry, you", answers: ["A. Prefer simple and subtle pieces", "B. Like items with a story or historical feel", "C.  Love bold, statement pieces", "D. Opt for functional or symbolic pieces"]},
    {question: "Q5. Your favorite gemstone is:", answers: ["A. Diamond", "B. Ruby/Sapphire", "C. Other gems", "D. No Preference"]},
    {question: "Q6. Your preferred jewelry piece is", answers: ["A. A delicate necklace", "B. A cocktail ring", "C. A statement cuff", "D. A charm bracelet"]},
    {question: "Q7. How do you usually wear your jewelry", answers: ["A. I wear the same pieces every day", "B. I carefully select pieces to match my outfit", "C. I mix and match for a unique look", "D. I rarely wear jewelry"]}
 

];//?s for quiz

var questionCount = 0;

var userChoices = [];

//^keeps track of choices made

var answerRoutes = {
    "A": "A",
    "B": "B",
    "C": "C",
    "D": "D"
};

// quiz
document.getElementById("quiz-button").onclick = function() {
    //open the popip based on click
    document.getElementById("quiz-popup").style.display = "block";
    displayCurrentQuestion();
}

function nextQuestion() {
    var pickedChoice = document.querySelector('input[name="option"]:checked').value ;
    // Map the selected option to its route and add to userChoices
    userChoices.push(answerRoutes[pickedChoice]); 
    
    //add route akachoice to userpath to where they will eventually be redirected
    //will chnage this code later to allow for check of path to redirect instead of printing results out as 
    //the alert does below
    if(questionCount < quizQuestions.length-1) {
        questionCount++;
        displayCurrentQuestion();
    } else { //quiz done
        const predominantChoice = getPredominantChoice();
       
        const searchKeywords = getSearchKeywords(predominantChoice);
        const searchString = searchKeywords.join('+');
                //join multiple keyword if seperated
                // not completely needed since search already does spilitting
        const description = getDescriptionForChoice(predominantChoice);
        //for description of why you got what results
        // to search with 'q' query parameter, with key words passed
        window.location.href = `/search?q=${encodeURIComponent(searchString)}&desc=${encodeURIComponent(description)}`;

        document.getElementById("quiz-popup").style.display = "none";
    
        // this code will be changed to redirect the user based on their choices.
        // alert("Your path is "+userChoices.join(", "));
    }
}

function displayCurrentQuestion() {
    var currentQuestion = quizQuestions[questionCount];
    document.getElementById("question").textContent = currentQuestion.question;
    var choice = '';
    for(var counter=0; counter <currentQuestion.answers.length ; counter++) {
        choice 
        += '<input type="radio" name="option" value="'+
        ["A","B","C","D"][counter]+
        '"> '+
        currentQuestion.answers[counter]+'<br>';
    }
    document.getElementById("quiz-options").innerHTML = choice;
    if(questionCount === quizQuestions.length-1) {
        document.getElementById("next").textContent = "Submit";
        //final ?
    } else {
        // more questions after
        document.getElementById("next").textContent = "Next";
     //
    }
}//questions and options ^^^

function closeQuiz() {
    // Reset variables
    questionCount = 0;
    userChoices = [];
    document.getElementById("quiz-popup").style.display = "none";
}


function getPredominantChoice() {//set each to 0
    const tally = { "A": 0, "B": 0, "C": 0, "D": 0 };
    userChoices.forEach(choice => {
        tally[choice]++;
    });//as choices clicked tally count goes up depedning on choice

    return Object.keys(tally).reduce((a, b) => tally[a] > tally[b] ? a : b);
} 



function getSearchKeywords(choice) {
    const keywordsMap = {
        "A": ["simple, subtle, delicate, minimal"],
        "B": ["vintage, glamor, cocktail, exquisite, elegant"],
        "C": ["fashion, unique, bold, statement"],
        "D": ["comfortable, casual, versatile, meaning"]
    };//change the above key words if needed or add

    return keywordsMap[choice] || [];
}

function getDescriptionForChoice(choice) {
    switch(choice) {
        case 'A': return "Minimalist: Mostly A's: You have a minimalist style. You appreciate understated, high-quality pieces that are versatile and timeless. Your jewelry often has clean lines and simple shapes.";
        case 'B': return "Vintage Glamor: Mostly B's: You love vintage glamor. You are drawn to pieces that have an old-world feel or tell a story. Your jewelry is often intricate and ornate.";
        case 'C': return "Unique Avant-Garde: Mostly C's: You have a unique, avant-garde style. You are not afraid to make a statement and your jewelry is often eye-catching and unconventional.";
        case 'D': return "Sporty and Casual: Mostly D's: You have a sporty and casual style. You prefer jewelry that can keep up with your active lifestyle. Your pieces are functional and often hold a personal or symbolic meaning.";
        default: return "";
    }
}