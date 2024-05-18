import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import geoip from "geoip-lite"

const app = express();
const port =3000;
const APIURL = "http://api.openweathermap.org/data/2.5/forecast";
const myAPIKey = "youtAPI";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

let lons = 121.32;
let lats = 24.01;

app.get ("/",async(req,res)=>{

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip.includes('::ffff:')) {
        ip = ip.split('::ffff:')[1];
    }
    console.log(ip);
    const geo = geoip.lookup(ip);

    if (geo) {
        lons = geo.ll[1];
        lats = geo.ll[0];
        console.log(`Latitude: ${geo.ll[0]}, Longitude: ${geo.ll[1]}`);
    }

    try{
        const response = await axios.get(APIURL,{
                params: {
                    lon:lons,
                    lat:lats,
                    appid:myAPIKey
                },
            }
        );
       
        let responseData = {
            lon: response.data.city.coord.lon,
            lat: response.data.city.coord.lat,
            weather: response.data.list[0].weather[0].main,
            name: response.data.city.name,
            country: response.data.city.country,
            timezone: "UTC+"+(response.data.city.timezone/3600)
        }
        console.log(response.data.list[0].weather[0].main);
        console.log(response.data.city.timezone);

        res.render('index.ejs',{weatherdata:responseData});

        
    }catch(error){
        console.log("error "+error.response);
        res.status(500);
    }

});

app.post("/submit",(req,res)=>{
    lons = req.body.Lon;
    lats = req.body.Lat;
    res.redirect("/");
})


app.listen(port,()=>{
    console.log(`listening ${port}`);
})