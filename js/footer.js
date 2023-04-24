const shareData = {
    title: "מטס יום העצמאות ה-75",
    url: "https://matas.iaf.org.il/#main",
};

async function shareWebsiteLink()  {
    
    executeMacLinkShare(document.querySelector('.share-button'));

    try {
        await navigator.share(shareData);
      } catch (err) {}
};

function executeMacLinkShare(element){
    if(navigator.userAgent.includes("Mac") && !navigator.userAgent.includes("iPhone")){

        let macLink = document.querySelector('.macLinkShare');
        
        macLink.style.top = element.getBoundingClientRect().top + 'px';
        macLink.style.left = element.getBoundingClientRect().left +  20 + 'px';
        
        
        macLink.style.left = parseInt(macLink.style.left.slice(0,macLink.style.left.indexOf('px'))) + 90 + 'px';
        macLink.style.top = parseInt(macLink.style.top.slice(0,macLink.style.top.indexOf('px'))) - 12 + 'px'
        
        macLink.style.display = "block";

        navigator.clipboard.writeText('https://matas.iaf.org.il');
        setTimeout(() => {
        macLink.style.display = "none";
        }, 1000);
    }
    else{
        return;
    }
}