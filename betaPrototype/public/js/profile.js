function openLink(event, link){
    let i, sideContent, sideLink;

    sideContent = document.getElementsByClassName("side-content");
    for(i = 0; i < sideContent.length; i++){
        sideContent[i].style.display = "none";
    }

    sideLink = document.getElementsByClassName("sidelinks");
    for(i = 0; i < sideLink.length; i++){
        sideLink[i].className = sideLink[i].className.replace(" active", "");
    }

    document.getElementById(link).style.display = "block";
    event.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();