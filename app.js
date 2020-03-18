/**
 * app.js - script to deploy a simple webpage with static content and a contact
 *          form.
 * created: 2020-03-18
 * author: albert r. carnier guedes (arcguede@gmail.com)
 * licence: GNU General Public License v3.0 ( see file LICENSE )
 */

/**
 * Load required modules.
 */
var http = require('http');
var url  = require('url');
var fs   = require('fs');
var querystring = require('querystring');
var nodemailer = require('nodemailer');

/**
 * Config email transporter.
 */
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '<email>',
        pass: '<email pass>'
    }
});

/**
 * Map the routes to the correspondent html files.
 */ 
var contentMap = {
    "/"        : "html/index.html",
    "/contact" : "html/contact.html",
    "/about"   : "html/about-the-site.html" // 
}

/**
 * Config web server.
 */
var server = http.createServer( (request,response) => {

    // Verify with method was requested by client.
    switch( request.method ){

        // Post requests. In this app, only contact form realize a post request.
        case 'POST':

            // Convert post data to string.
            let data = '';       
            request.on('data', postData => {
                data += postData.toString();
            });

            request.on('end', () => {

                // Parse post data ( email message ).
                var message = querystring.parse(data);
                console.log("MESSAGE:");
                console.log(message);

                // Config email to send.
                var mailOptions = {
                    from: message.email,
                    to: '<email to send>',
                    subject: message.subject,
                    text: "Message from "+message.name+"\n"+message.message
                };

                // Send email.
                transporter.sendMail(mailOptions, (error, info) => {
                    if( error ){ 
                        console.log("EMAIL ERROR:");
                        console.log(error);
                    } 
                    else{
                        console.log('EMAIL SENT:');
                        console.log(info.response);
                    }
                });

                // Return to contact page after sendo ( or not ) the message.
                console.log("REDIRECT to '/contact'");
                response.writeHead(301, { "Location": "/contact" });
                response.end();

            });

            break;

        // All regular pages are 'get' requests.    
        case 'GET':

            // Get the path of url from root. 
            var pathName = url.parse(request.url).pathname;
            console.log("URL '"+pathName+"' requested.");

            // Verify if the correspondent route exists.
            if(contentMap[pathName]){

                // Get the html file correspondent to route.
                file = __dirname+"/"+contentMap[pathName];
                console.log("FILE '"+file+"' requested.");

                // Verify if file exists, if yes, print on client.
                fs.readFile(file, ( pageError, pageResponse ) => {

                    if( pageError ){
                        response.writeHead(404, { 'Content-Type': 'text/plain' });
                        response.write('ERROR 404 : Page Not Found.');
                        console.log(pageError);
                    }
                    else{
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.write(pageResponse);
                    }
             
                    response.end();
        
                });

            } 
            else {
                // If route dont exists, show error 404 message.
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.write('ERROR 404 : Page Not Found.');
                response.end();
            }

            break;

        default:
            break;

    }

});

// Exec server on port 5050.
server.listen(5050); 
console.log("Server Started listening on 'http://localhost:5050'.");
