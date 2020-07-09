let cookieString = "";
let jsSession = "";
let odd = 0;

//function that return date from timestamp
const dateFromStamp = (timestamp) => {
    const todate=new Date(timestamp).getDate();
    const tomonth=new Date(timestamp).getMonth()+1;
    const toyear=new Date(timestamp).getFullYear();
    const tohour=new Date(timestamp).getHours();
    const tominute=new Date(timestamp).getMinutes();
    return `${tomonth}/${todate}/${toyear}  ${tohour}:${tominute}`;
}


//function that inserts notifications into the DOM
const insertData = ({unreadMessages, messages}) => {

    //main heading
    const dom = document.getElementById('root');
    dom.innerHTML = '';
    const element = document.createElement('div');
    element.className = 'main-heading';
    element.innerText = `You have a total of ${unreadMessages} unread notifications.`;
    dom.appendChild(element);


    //notifications
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    dom.appendChild(notificationContainer);

    
    for(el of messages){

        //only display the alert if the user haven't read it already
        if(el.headline && !el.read){
            
            odd++;

            const alert = document.createElement('div');
            alert.className = odd%2===1 ? 'box dark' : 'box';
            
            const para = document.createElement('a');
            para.href = 'https://www.linkedin.com/notifications';
            para.target = '_blank';
            para.rel = 'noopener noreferrer';
            para.className = 'text';

            const title = document.createElement('h4');    
            title.className = 'title';
            
            const time = document.createElement('p');
            time.className = 'time';

            para.innerText = el.headline.text;
            title.innerText = el.kickerText ? el.kickerText.text : 'NEW NOTIFICATION';
            time.innerText = dateFromStamp(el.publishedAt);

            alert.appendChild(title);
            alert.appendChild(para);
            alert.appendChild(time);

            dom.appendChild(alert);    
        }
        
    }
}

//function that provides link for login/signup page
const renderLoginButton = () => {

    const dom = document.getElementById('root');
    dom.innerHTML = '';

    const element = document.createElement('div');
    element.className = 'main-heading';
    element.innerText = `You are not logged in. Please login to access remote notifications.`;
    dom.appendChild(element);

    const button = document.createElement('a');
    button.innerText = 'LOGIN';
    button.className = 'button';
    button.href = 'https://www.linkedin.com';
    button.target = '_blank';
    button.rel = 'noopener noreferrer';

    dom.appendChild(button);
}



//function that makes request to voyager API with appropriate headers
const heavyLift = async () => {
    
    try {
        const data = await fetch("https://www.linkedin.com/voyager/api/notifications/dash/cards?&decorationId=com.linkedin.voyager.dash.deco.identity.notifications.CardsCollection-29&q=notifications&segmentUrn=urn%3Ali%3Afsd_notificationSegment%3ANEW&start=0", {
            "headers": {
            "accept": "application/vnd.linkedin.normalized+json+2.1",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "csrf-token": jsSession,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-li-deco-include-micro-schema": "true",
            "x-li-lang": "en_US",
            "x-li-page-instance": "urn:li:page:d_flagship3_notifications;OsxGddKtSIOpDSLz1SUMJw==",
            "x-li-track": "{\"clientVersion\":\"1.6.8193\",\"osName\":\"web\",\"timezoneOffset\":5.5,\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1,\"displayWidth\":1366,\"displayHeight\":768}",
            "x-restli-protocol-version": "2.0.0",
            "cookie": cookieString
            },
            "referrer": "https://www.linkedin.com/notifications/",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors"
        });


        if(data.status === 200){
            const d = await data.json();
            
            const message = {
                unreadMessages: d.data.metadata.numUnseen,
                messages: d.included
            };

            insertData(message);
            

        }else{
            throw new Error('login failed');
        }

    } catch (error) {
        //user not logged in 
        //render login button
        renderLoginButton();    
    }
}


//function that gets executed right away
const main = () => {

    //show loading text while we make network calls
    const element = document.createElement('div');
    element.className = 'main-heading';
    element.innerText = 'Still Loading...'
    document.getElementById('root').appendChild(element);


    //fetching all cookies from linkedin
    chrome.cookies.getAll({
        url: "https://www.linkedin.com"
    }, d => {

        for(el of d){
            
            if(el.name === 'JSESSIONID'){
                jsSession = el.value.split('"')[1];
            }

            const { name, value } = el;
            let tempString = `${name}=${value}`;
            
            if(el.name !== d[d.length-1].name){
                tempString += "; ";
            };

            cookieString += tempString;
        }

        heavyLift();
        
    })
}

main();
