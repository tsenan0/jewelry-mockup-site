function setFlashMessageFadeout(flashElement){
    setTimeout(() => {
        let currentOpacity = 1.0;
        let timer = setInterval(()=>{
            if(currentOpacity < .05){
                clearInterval(timer);
                flashElement.remove();
            }
            currentOpacity = currentOpacity - .05;
            flashElement.style.opacity = currentOpacity;
        }, 100);
    }, 4000);
}
let flashElement = document.getElementById('flash-message');
if(flashElement){
    setFlashMessageFadeout(flashElement);
}