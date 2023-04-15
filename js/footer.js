const shareData = {
    title: "מטס יום העצמאות ה-75",
    url: "https://matas.iaf.org.il/#main",
};

async function shareWebsiteLink()  {
    try {
        await navigator.share(shareData);
      } catch (err) {}
};