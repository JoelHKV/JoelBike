import './style.css'

var map;
var regulargooglemarker = []
var polyline = [];
var stationdata
var stationskeys = []
var tripdata
var stationview = 1
var pagerange
var activestationid = 501
var heatmapmaxradius = 200
var displaymap = 1
var daterange = [[2021, 5, 1], [2021, 7, 31]]

var name = 'Nimi'
var address = 'Osoite'
var city = 'Kaupunki'
var helsinki = 'Helsinki'



// station data transformed to json where station id is the key. json is imported and hardcoded into js for speed and importance
import * as data2 from './stations_HelsinkiEspoo.json'
stationdata = data2.default

// here we define the layout 
var placeitems = [['stationvstrip', 10, 2, 30, 9],
['stationvstrip2', 50, 2, 30, 9],
['menu', 10, 30, 70, 70],
['menutitleb', 10, 24.3, 70, 4],
['menutitle', 10, 24.3, 70, 4],
['filterStations', 55, 24.9, 80, 3],
['map-container', 10, 30, 70, 70],
['innercalendar', 10, 30, 70, 70],
['departure_dropdown', 10, 17, 30, 6],
['return_dropdown', 50, 17, 30, 6],
['infoboard', 10, 16, 40, 10],
['infoboard3', 51, 16, 30, 10],
['goUp', 83, 36, 10, 10],
['scrollUp', 83, 48, 10, 10],
['currentdate', 83, 60, 10, 10],
['scrollDown', 83, 72, 10, 10],
['goDown', 83, 84, 10, 10],
['stationdetailsFrom', 12, 31, 10, 10],
['stationdetailsTo', 24, 31, 10, 10],
['stationdetailsFrom2', 41, 31, 10, 10],
['stationdetailsTo2', 53, 31, 10, 10],
['closemap', 70, 31, 10, 10],
['backgroundgray', 5, 13, 90, 92],
['downloadboard', 10.5, 30.2, 68, 68],
['language', 83, 15, 10, 10]]

// we swap the buttons to the bottom for narrow layouts
var placeitemsnarrow = [['backgroundgray', 5, 13, 80, 106],
['goDown', 10, 104, 10, 10],
['scrollDown', 24, 104, 10, 10],
['currentdate', 38, 104, 10, 10],
['scrollUp', 52, 104, 10, 10],
['goUp', 68, 104, 10, 10],
['filterStations', 70, 24.9, 80, 3],
['language', 82, 104, 10, 10]]


if (window.innerWidth > 900) {
    fixitemsize(placeitems, 0.9, 1, 1)
}
else {
    fixitemsize(placeitems, 0.8, 20, 1.2)
    fixitemsize(placeitemsnarrow, 0.8, 20, 1.2)
}


// adjust layout after window resize
window.onresize = function () {
    if (window.innerWidth > 900) {
        fixitemsize(placeitems, 0.9, 1, 1)
    }
    else {
        fixitemsize(placeitems, 0.8, 20, 1.2)
        fixitemsize(placeitemsnarrow, 0.8, 20, 1.2)
    }
};


function fixitemsize(placeitems, containerreltoScreen, woff, wfac) {
    // measure the container and place everything in relation
    document.getElementById('container').style.height = containerreltoScreen * window.innerHeight + 'px'

    const containerelement = document.querySelector("#container");
    var containerwidth = parseInt(window.getComputedStyle(containerelement).width)
    var containerheight = parseInt(window.getComputedStyle(containerelement).height)



    for (let i = 0; i < placeitems.length; i++) {

        const element = document.getElementById(placeitems[i][0])
        element.style.left = (containerwidth * placeitems[i][1] / 100 - woff) + 'px'
        element.style.top = containerheight * placeitems[i][2] / 100 + 'px'
        element.style.width = wfac * (containerwidth * placeitems[i][3] / 100) + 'px'
        element.style.height = containerheight * placeitems[i][4] / 100 + 'px'


    }
    document.getElementById('filterStations').style.width = containerwidth * 20 / 100 + 'px'
}

function stacknHide(stackElements, startZ, hideElements) {
    // makes elements visible and hidden based on what the user is doing
    for (let i = 0; i < stackElements.length; i++) {
        document.getElementById(stackElements[i]).style.zIndex = startZ + 30 - i
        document.getElementById(stackElements[i]).style.visibility = "visible"
    }
    for (let i = 0; i < hideElements.length; i++) {
        document.getElementById(hideElements[i]).style.visibility = "hidden"
    }
}

//  this is the starting view arrangement
stacknHide([], 1, ['circle', 'downloadboard', 'departure_dropdown', 'return_dropdown', 'infoboard3', 'closemap', 'stationdetailsFrom', 'stationdetailsTo', 'stationdetailsFrom2', 'stationdetailsTo2', 'map-container'])




//  add listeners to buttons and the like

document.getElementById('stationvstrip').addEventListener("click", stationTripView);
document.getElementById('stationvstrip2').addEventListener("click", stationTripView2);
document.getElementById('currentdate').addEventListener("click", changeDate);


const filterStations = document.getElementById('filterStations')


filterStations.addEventListener("input", () => {
    update2stations(stationdata)
})


document.querySelector("#goUp").addEventListener("click", function () {


    if (stationview == 1) { menu.scrollTop = 0; return }
    pagerange = 0;
    showtripdata(tripdata, -1)

});
document.querySelector("#scrollUp").addEventListener("click", function () {
    if (stationview == 1) { menu.scrollTop -= menu.scrollHeight / 20; return }
    pagerange -= 1000;
    if (pagerange < -450) { pagerange = -450 }
    showtripdata(tripdata, 0)

});
document.querySelector("#scrollDown").addEventListener("click", function () {
    if (stationview == 1) { menu.scrollTop += menu.scrollHeight / 20; return }
    pagerange += 1000;
    if (pagerange > Object.entries(tripdata).length + 450) { pagerange = Object.entries(tripdata).length + 450 }
    showtripdata(tripdata, 0)
});
document.querySelector("#goDown").addEventListener("click", function () {
    if (stationview == 1) { menu.scrollTop = menu.scrollHeight; return }
    pagerange = Object.entries(tripdata).length;

    showtripdata(tripdata, 1)
});

document.querySelector("#stationdetailsTo").addEventListener("click", function () {
    erasemarkersandpolylines()
    getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=R' + activestationid.toString(), 'did', 0)
});

document.querySelector("#stationdetailsFrom").addEventListener("click", function () {
    erasemarkersandpolylines()
    getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=D' + activestationid.toString(), 'rid', 0)
});

document.querySelector("#stationdetailsTo2").addEventListener("click", function () {
    erasemarkersandpolylines()
    getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=R' + activestationid.toString(), 'did', 1)
});

document.querySelector("#stationdetailsFrom2").addEventListener("click", function () {
    erasemarkersandpolylines()
    getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=D' + activestationid.toString(), 'rid', 1)
});



document.querySelector("#closemap").addEventListener("click", function () {
    erasemarkersandpolylines()
    stacknHide(['stationvstrip', 'stationvstrip2'], 1, ['infoboard3', 'closemap', 'stationdetailsFrom', 'stationdetailsTo', 'stationdetailsFrom2', 'stationdetailsTo2', 'map-container', 'infoboard'])

    if (stationview == 1) {
        stacknHide(['filterStations', 'menutitleb'], 1, [])

    }
    else {
        stacknHide(['menutitle', 'departure_dropdown', 'return_dropdown'], 1, [])
    }



});



function erasemarkersandpolylines() {
    // erase markers and drawings on google maps
    for (let i = 0; i < regulargooglemarker.length; i++) {
        regulargooglemarker[i].setMap(null);
    }
    regulargooglemarker.length = 0;

    for (let i = 0; i < polyline.length; i++) {
        polyline[i].setMap(null);
    }
    polyline.length = 0;

}



function changeDate() {
    // run when inner calendar date is selected. then fetch data for that date
    if (departure_dropdown.value != 'Select Departure' || return_dropdown.value != 'Select Return') { return }


    if (stationview == 1) { return }
    var thisdate = document.getElementById("currentdate").innerHTML
    var generatedHTML = openCalendarWindow(daterange[0][0], daterange[0][1] - 1, daterange[1][1], thisdate)
    document.getElementById("innercalendar").innerHTML = generatedHTML;
    let generatedCells = document.getElementsByClassName("generatedCell");
    document.getElementById("innercalendar").style.zIndex = 10
    for (let i = 0; i < generatedCells.length; i++) {
        generatedCells[i].addEventListener('click', function () {
            let param = this.getAttribute("data-param");
            document.getElementById("currentdate").innerHTML = param
            document.getElementById(thisdate).style.backgroundColor = '#ffffff'
            document.getElementById(param).style.backgroundColor = '#999999'
            var dates = document.getElementById("currentdate").innerHTML.split('.')
            var datestr = dates[2].toString() + '-' + dates[1].toString().padStart(2, '0') + '-' + dates[0].toString().padStart(2, '0')
            getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + datestr, 3)

            setTimeout(() => {
                document.getElementById("innercalendar").style.zIndex = -1
            }, 400)

        });
    }

}



document.querySelector("#language").addEventListener("click", function () {








    // change language and update everything; note: if station / trip is selected the highlight on the list disappers 

    var thislanguage = document.getElementById('language').innerHTML
    var newlanguage
    if (thislanguage == 'FI') { newlanguage = 'SV'; name = 'Namn'; address = 'Adress'; helsinki = 'Helsingfors' }
    if (thislanguage == 'SV') { newlanguage = 'EN'; name = 'Name'; address = 'Osoite'; helsinki = 'Helsinki' }
    if (thislanguage == 'EN') { newlanguage = 'FI'; name = 'Nimi'; address = 'Osoite'; helsinki = 'Helsinki' }

    document.getElementById('language').innerHTML = newlanguage
    popupstations(stationdata, stationskeys)

    if (stationview == 1) {
        update2stations(stationdata)
        writeinfoboard(activestationid, 'station')
    }
    if (stationview == -1) {
        showtripdata(tripdata, 0)
        writeinfoboard(activestationid, 'trip')
    }

});


function gettripdata(data) {
    // filter trip data based on pull down menu selections
    tripdata = data
    let regex = /\(([^)]+)\)/;
    var stationdid = 0
    var stationrid = 0
    if (departure_dropdown.value != 'Select Departure') { stationdid = regex.exec(departure_dropdown.value)[1]; }

    if (return_dropdown.value != 'Select Return') { stationrid = regex.exec(return_dropdown.value)[1]; }


    if (stationdid == 0 && stationrid == 0) {
        pagerange = Math.round(Object.entries(tripdata).length / 2)
        showtripdata(tripdata, 0)
    }
    else {

        var triptempdata = []
        for (let i = 0; i < Object.entries(tripdata).length; i++) {
            if (tripdata[i]["did"] == stationdid && tripdata[i]["rid"] == stationrid) {
                triptempdata.push(tripdata[i])
            }
            if (stationdid == 0 && tripdata[i]["rid"] == stationrid) {
                triptempdata.push(tripdata[i])
            }
            if (tripdata[i]["did"] == stationdid && stationrid == 0) {
                triptempdata.push(tripdata[i])
            }

        }
        pagerange = Object.entries(triptempdata).length
        showtripdata(triptempdata, 0)
        return

    }

}

const menu = document.querySelector("#menu");

function additemtopulldown(text, mode) {
    // populate station data to pull down menus
    const item = document.createElement("div");
    item.classList.add("menu-item");
    const col = document.createElement("div");
    col.classList.add(`col`, `col-1`);
    col.style.width = `100%`;
    if (mode != 2) {
        col.style.border = '1px solid black'
        col.style.backgroundColor = '#A5A5A5'
    }
    col.style.textAlign = "center";
    col.textContent = text
    item.appendChild(col);

    if (mode != 2) {
        item.addEventListener("click", function () {
            if (mode == -1) { pagerange -= 1000; showtripdata(tripdata, 1) }
            if (mode == 1) { pagerange += 1000; showtripdata(tripdata, -1) }

            if (mode == 3) { changeday(1) }
            if (mode == -3) { changeday(-1) }
        });
    }
    menu.appendChild(item)

}

function changeday(step) {
    // increment or decrement one day if user browses to the end of the list and chooses to do so
    var dates = document.getElementById("currentdate").innerHTML.split('.')

    var date = new Date(dates[2], dates[1] - 1, dates[0])
    date.setDate(date.getDate() + step);
    var minDate = new Date(daterange[0]);
    var maxDate = new Date(daterange[1]);

    date = date > maxDate ? maxDate : date < minDate ? minDate : date;
    dates = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    var datestr = dates[2].toString() + '-' + dates[1].toString().padStart(2, '0') + '-' + dates[0].toString().padStart(2, '0')
    document.getElementById("currentdate").innerHTML = dates[0].toString() + '.' + dates[1].toString() + '.' + dates[2].toString()

    getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + datestr, 3)

}


function stationDetailMap(tempstatdata, tofrom, isheatmap) {
    // analyze trip data based on station and show either top trips or heatmap

    // tofrom is either did or rid for dep or ret station id respectively

    stacknHide(['infoboard3'], 1, [])
    var nroTrips = Object.entries(tempstatdata).length
    var distArray = []
    var timeArray = []
    var stationCount = new Array(1000).fill(0); // init array for station id count
    var circularArray = new Array(360).fill(0);
    for (let i = 0; i < nroTrips; i++) {
        let distnum = parseFloat(tempstatdata[i]["dis"]);
        if (isFinite(distnum)) { distArray.push(distnum) }
        let timenum = parseInt(tempstatdata[i]["time"]);
        if (isFinite(timenum)) { timeArray.push(timenum) }
        let statnum = parseInt(tempstatdata[i][tofrom]);


        if (statnum in stationdata) {

            var xShift = parseFloat(stationdata[statnum]["x"] - stationdata[activestationid]["x"])
            var yShift = parseFloat(stationdata[activestationid]["y"] - stationdata[statnum]["y"])

            var direction = parseInt(Math.atan2(yShift, xShift) * 180 / Math.PI);
            if (direction < 0) { direction = 360 + direction; }


            circularArray[direction]++
            stationCount[statnum]++ // increment if dep/ret is founf
        }
    }


    const averageDist = Math.round(10 * (distArray.reduce((a, b) => a + b, 0) / distArray.length)) / 10;
    const averageTime = Math.round(1 * (timeArray.reduce((a, b) => a + b, 0) / timeArray.length)) / 1;
    document.getElementById('infoboard3').innerHTML = 'Trips: ' + nroTrips + '<BR>Avg dist: ' + averageDist + ' km<BR>Avg time: ' + averageTime + ' min'


    if (isheatmap == 1) {

        const movingAverageWindow = 10;
        const movingAverage = [];
        var MAAverage = 0;
        for (let i = 0; i < circularArray.length; i++) {
            let sum = 0;
            for (let j = i - movingAverageWindow; j <= i + movingAverageWindow; j++) {
                const index = j >= 0 && j < circularArray.length
                    ? j
                    : j < 0
                        ? j + circularArray.length
                        : j - circularArray.length;
                sum += circularArray[index];
            }
            var temp = sum / (movingAverageWindow * 2 + 1)
            MAAverage += temp
            movingAverage.push(temp);
        }


        MAAverage = MAAverage / movingAverage.length

        for (let i = 0; i < movingAverage.length; i++) {
            movingAverage[i] = movingAverage[i] * 40 / MAAverage
            if (movingAverage[i] < 10) { movingAverage[i] = 10 }
            if (movingAverage[i] > 200) { movingAverage[i] = 200 }


        }

        addmarker([stationdata[activestationid]["y"], stationdata[activestationid]["x"]], ' ', 1, movingAverage)
        return
    }

    if (isheatmap == 0) {

        var indices = new Array(1000);
        for (var i = 0; i < 1000; ++i) indices[i] = i;
        indices.sort(function (a, b) { return stationCount[a] < stationCount[b] ? -1 : stationCount[a] > stationCount[b] ? 1 : 0; });

        var this_loc = [stationdata[activestationid]["y"], stationdata[activestationid]["x"]]

        for (var i = 999; i > 994; i--) {

            var other_loc = [stationdata[indices[i]]["y"], stationdata[indices[i]]["x"]]
            addPolyline(this_loc, other_loc, 1000 - i, 'markersnocenter', tofrom, indices[i])

        }

        return
    }

}

function showtripdata(triptempdata, scroll) {
    // displays part of trip data and appropriate endings for browsing
    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

    var nroitems = Object.entries(triptempdata).length

    var filteredview = 1
    if (departure_dropdown.value == 'Select Departure' && return_dropdown.value == 'Select Return') {
        filteredview = 0
    }


    if (nroitems == 0) {
        additemtopulldown('No trips', 2)
        return
    }

    const columnWidths = [25, 25, 25, 10, 10];
    var lenlen = 500

    var startoffset = Math.max((pagerange - lenlen), 0)

    if (startoffset == 0 && filteredview == 0) {
        additemtopulldown('Previous Day', -3)
    }
    if (startoffset > 0 && filteredview == 0) {
        additemtopulldown('Earlier Time', -1)
    }
    if (filteredview == 1) {
        additemtopulldown('Beginning of Data', 2)
    }

    for (let i = startoffset; i < Math.min((pagerange + lenlen), nroitems); i++) {
        //  a few invalid station id codes are filtered here (next time filter in data import already)
        if (triptempdata[i]["did"] in stationdata && triptempdata[i]["rid"] in stationdata) {

            const item = document.createElement("div");
            item.classList.add("menu-item");

            for (let j = 1; j <= 5; j++) {
                const col = document.createElement("div");
                col.classList.add(`col`, `col-${i}`);
                col.style.width = `${columnWidths[j - 1]}%`;
                col.style.textAlign = "left";
                col.style.overflow = "hidden";
                if (j == 1) { col.textContent = triptempdata[i]["Departure"].substring(8, 10) + '.' + triptempdata[i]["Departure"].substring(5, 7) + ' ' + triptempdata[i]["Departure"].substring(11, 16) };
                if (j == 2) { col.textContent = stationdata[triptempdata[i]["did"]][name] };
                if (j == 3) { col.textContent = stationdata[triptempdata[i]["rid"]][name] };
                if (j == 4) { col.textContent = triptempdata[i]["dis"] };
                if (j == 5) { col.textContent = triptempdata[i]["time"] };
                item.appendChild(col);
            }

            item.addEventListener("click", function () {
                const items = menu.querySelectorAll(".menu-item");
                for (const it of items) {
                    it.style.backgroundColor = "";
                }
                this.style.backgroundColor = "gray";
                var thisitemnro = startoffset + Array.from(items).indexOf(this) - 1

                var dep_loc = [stationdata[triptempdata[thisitemnro]["did"]]["y"], stationdata[triptempdata[thisitemnro]["did"]]["x"]]
                var ret_loc = [stationdata[triptempdata[thisitemnro]["rid"]]["y"], stationdata[triptempdata[thisitemnro]["rid"]]["x"]]


                activestationid = triptempdata[thisitemnro]
                writeinfoboard(activestationid, 'trip')
                showmap([dep_loc, ret_loc], 2)

            });

            menu.appendChild(item);
        }
    }

    if (nroitems <= pagerange + lenlen && filteredview == 0) {
        additemtopulldown('Next Day', 3)
    }
    if (nroitems > pagerange + lenlen && filteredview == 0) {
        additemtopulldown('Later Time', 1)
    }
    if (filteredview == 1) {
        additemtopulldown('End of Data', 2)
    }



    if (scroll == 1) { menu.scrollTop = menu.scrollHeight; }
    if (scroll == 0) { menu.scrollTop = menu.scrollHeight / 2; }
    if (scroll == -1) { menu.scrollTop = 0; }

}


let departure_dropdown = document.getElementById("departure_dropdown");
let return_dropdown = document.getElementById("return_dropdown");

departure_dropdown.onchange = onSelectChange;
return_dropdown.onchange = onSelectChange;

function onSelectChange() {
    // when pull down menu is changes new data need to be fetched
    let regex = /\(([^)]+)\)/;
    var stationdid = 0
    var stationrid = 0
    if (departure_dropdown.value != 'Select Departure') { stationdid = regex.exec(departure_dropdown.value)[1]; }

    if (return_dropdown.value != 'Select Return') { stationrid = regex.exec(return_dropdown.value)[1]; }

    if (stationdid == 0 && stationrid == 0) {
        document.getElementById("currentdate").style.opacity = 1;
        var dates = document.getElementById("currentdate").innerHTML.split('.')
        var datestr = dates[2].toString() + '-' + dates[1].toString().padStart(2, '0') + '-' + dates[0].toString().padStart(2, '0')
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + datestr, 3)
        return
    }
    if (stationdid > 0) {
        document.getElementById("currentdate").style.opacity = 0.4;
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=D' + stationdid.toString(), 3)
        return
    }
    if (stationdid == 0) {
        document.getElementById("currentdate").style.opacity = 0.4;
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=R' + stationrid.toString(), 3)
        return
    }

}


const canvas = document.getElementById("circle");
const ctx = canvas.getContext("2d");


function drawCircle(radiusList) {
    // this is the draw the heatmap


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = canvas.width;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 360; i++) {
        const angle = (i * Math.PI) / 180;
        const x = centerX + radiusList[i] * Math.cos(angle);
        const y = centerY + radiusList[i] * Math.sin(angle);

        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();


    var gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
    gradient.addColorStop(0, "blue");
    gradient.addColorStop(0.2, "green");
    gradient.addColorStop(0.5, "yellow");
    gradient.addColorStop(1, "red");

    ctx.fillStyle = gradient;
    ctx.fill();

    const dataURI = canvas.toDataURL();

    return dataURI

}



function addmarker(coords, labeltext, mode, movingAverage, thisid) {
    // add a heatmap as a custom marker or a regular one
    if (mode == 1) {

        var customMarker = drawCircle(movingAverage)

        var markerImage = new google.maps.MarkerImage(
            customMarker,

            new google.maps.Size(2 * heatmapmaxradius, 2 * heatmapmaxradius),
            new google.maps.Point(0, 0),
            new google.maps.Point(heatmapmaxradius, heatmapmaxradius)
        )

        var temp = new google.maps.Marker({
            position: { lat: coords[0], lng: coords[1] },
            map: map,
            icon: markerImage,

        });
    }

    if (mode == 0) {

        var temp = new google.maps.Marker({
            position: { lat: coords[0], lng: coords[1] },
            map: map,

            label: {
                text: labeltext,
                color: 'black',
                fontSize: "24px",
                fontWeight: 'bold'
            },

        });
    }

    regulargooglemarker.push(temp)

    temp.addListener('click', function () {

        writeinfoboard(thisid, 'station', 2)

    });


}


function showmap(coords, mode) {
    // shows google map
    if (stationview == 1) {

        stacknHide(['stationdetailsFrom2', 'stationdetailsFrom'], 1, ['stationvstrip2'])
        stacknHide(['stationdetailsTo2', 'stationdetailsTo'], 1, [])

    }
    if (stationview == -1) {


        stacknHide([], 1, ['stationvstrip'])
    }

    stacknHide(['closemap', 'map-container', 'infoboard'], 1, ['filterStations', 'departure_dropdown', 'return_dropdown', 'menutitle', 'menutitleb'])

    if (displaymap == 0) { return }



    if (mode == 1) {
        map.setCenter({ lat: coords[0], lng: coords[1] });
        addmarker(coords, ' ', 0, 0)


        fitMapToBounds([
            { lat: coords[0] + 0.005, lng: coords[1] + 0.005 },
            { lat: coords[0] - 0.005, lng: coords[1] - 0.005 },
        ]);
    }

    if (mode == 2) {
        addPolyline(coords[0], coords[1], ' ', 'fittobounds', 0)
    }



}



function addPolyline(dep_loc, ret_loc, markerlabel, mode, tofrom, thisid) {
    // add arrows to google maps in trip view


    var start = { lat: dep_loc[0], lng: dep_loc[1] };
    var end = { lat: ret_loc[0], lng: ret_loc[1] };

    if (tofrom == 'did') { [start, end] = [end, start]; } // swap the direction of arrays 

    if (mode == 'fittobounds') {
        map.setCenter({ lat: (dep_loc[0] + ret_loc[0]) / 2, lng: (dep_loc[1] + ret_loc[1]) / 2 });
        fitMapToBounds([
            { lat: Math.max(dep_loc[0], ret_loc[0]), lng: Math.max(dep_loc[1], ret_loc[1]) },
            { lat: Math.min(dep_loc[0], ret_loc[0]), lng: Math.min(dep_loc[1], ret_loc[1]) },
        ]);

        stacknHide([], 1, ['stationdetailsFrom', 'stationdetailsTo', 'stationdetailsFrom2', 'stationdetailsTo2'])

    }

    if (mode == 'markersnocenter') {
        addmarker(ret_loc, markerlabel.toString(), 0, 0, thisid)
    }

    var temp = new google.maps.Polyline({
        path: [start, end],
        geodesic: true,
        strokeColor: "#ff0000",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        icons: [{
            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
            offset: "100%",
        }],
        map: map
    });

    polyline.push(temp)

}


// selects the area of google maps so that start and end is visible 
function fitMapToBounds(latLngArray) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < latLngArray.length; i++) {
        bounds.extend(latLngArray[i]);
    }
    map.fitBounds(bounds);
}



function openCalendarWindow(currentYear, startMonth, endMonth, graydate) {
    /// custom calendar selector as innerHTML
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    let colcol = '#ffffff'
    let calendarHTML = `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }

      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
        cursor: pointer;
      }</style>`

    for (let currentMonth = startMonth; currentMonth < endMonth; currentMonth++) {
        const numberOfDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        calendarHTML += `
 
    <table>
      <thead>
        <tr>            
          <th colspan="7">${monthNames[currentMonth]} ${currentYear}</th>          
        </tr>
        <tr>
            <th colspan="7">&nbsp;</th>
        </tr>
        <tr>
          <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
        </tr>
      </thead>
      <tbody>
        <tr>
  `;

        let firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        let firstDayOfWeek = firstDayOfMonth.getDay() || 7;
        let currentDay = 1;
        for (let i = 1; i < firstDayOfWeek; i++) {
            calendarHTML += `<td></td>`;
        }

        while (currentDay <= numberOfDaysInMonth) {
            if (firstDayOfWeek === 8) {
                calendarHTML += "</tr><tr>";
                firstDayOfWeek = 1;
            }

            var thisdate = currentDay + '.' + (currentMonth + 1) + '.' + currentYear
            if (thisdate == graydate) { colcol = '#999999' }
            calendarHTML += `<td style="cursor: pointer; background-color: ${colcol};" id='${thisdate}' class="generatedCell" data-param='${thisdate}'>${currentDay}</td>`;
            colcol = '#ffffff'

            firstDayOfWeek++;
            currentDay++;
        }
        calendarHTML += `
        </tr>
      </tbody>
    </table>`

    }
    return calendarHTML
}

update2stations(stationdata)

window.onload = function () {



    if (displaymap == 1) {
        const maploc = { lat: 64, lng: 26 };
        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 5,
            center: maploc,
        });
    }



};





function getdata(thisaddress, mode, display) {
    // fetches the data from a google cloud function
    if (mode != 'did' && mode != 'rid') {
        document.getElementById('downloadboard').innerHTML = '<BR><BR>Downloading'
        stacknHide(['downloadboard'], 1, [])
    }
    fetchThis(thisaddress, mode, display)
        .then((data) => {
            stacknHide([], 1, ['downloadboard'])
            // if (mode == 1) { update2stations(data) }
            if (mode == 3) { gettripdata(data) }
            if (mode == 'did' || mode == 'rid') { stationDetailMap(data, mode, display) }
        })
        .catch(error => {
            document.getElementById('downloadboard').innerHTML = '<BR><BR>Error downloading data<BR>refresh or try again later'
            stacknHide(['downloadboard'], 1, [])
        })


    async function fetchThis(thislocation, mode) {

        let response = await fetch(thislocation,
            {
                method: 'GET'
            });

        if (response.headers.get('Content-Type').includes('application/json')) {
            return await response.json();
        }
        else {
            return await response.text();
        }

    }

}


function popupstations(stationdata, tempkeys) {
    departure_dropdown.options.length = 0;
    return_dropdown.options.length = 0;
    for (let i = -1; i < tempkeys.length; i++) {
        let option = document.createElement("option");
        if (i > -1) {
            option.text = stationdata[tempkeys[i]][name] + ' (' + tempkeys[i] + ')'
            departure_dropdown.add(option);
            return_dropdown.add(option.cloneNode(true));
        }

        else {
            option.text = 'Select Departure'
            departure_dropdown.add(option);

            let option2 = document.createElement("option");
            option2.text = 'Select Return'
            return_dropdown.add(option2);

        }
    }

}


function update2stations(data) {
    // updates station info

    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

    const filterValue = filterStations.value.toLowerCase();
    //  stationdata = data

    let sortedData = Object.entries(stationdata).sort((a, b) => {
        if (a[1][name] > b[1][name]) {
            return 1;
        } else {
            return -1;
        }
    });

    stationskeys = sortedData.map(item => item[0]);
    popupstations(stationdata, stationskeys)

    //stationskeys = []
    let filteredkeys = []
    for (let i = 0; i < stationskeys.length; i++) {
        var thisname = stationdata[stationskeys[i]][name]
        if (thisname.toLowerCase().startsWith(filterValue) == true) {
            filteredkeys.push(stationskeys[i]) // we need this to make a shorted index list for filtered stations
            const item = document.createElement("div");
            item.classList.add("menu-item");
            const col = document.createElement("div");
            col.classList.add(`col`, `col-1`);
            col.style.width = `100%`;
            col.style.textAlign = "left";
            col.textContent = thisname
            item.appendChild(col);

            item.addEventListener("click", function () {
                const items = menu.querySelectorAll(".menu-item");
                for (const it of items) {
                    it.style.backgroundColor = "";
                }
                this.style.backgroundColor = "gray";
                var thisitemnro = Array.from(items).indexOf(this)

                writeinfoboard(filteredkeys[thisitemnro], 'station')

                var coords = [stationdata[filteredkeys[thisitemnro]]["y"], stationdata[filteredkeys[thisitemnro]]["x"]]
                activestationid = filteredkeys[thisitemnro]
                showmap(coords, 1)

            });

            menu.appendChild(item)

        }

    }


}

function writeinfoboard(stationid, mode, whichtextfield) {
    // writes specific station info
    if (mode == 'trip') {
        let temphtml = 'From: ' + stationdata[stationid["did"]][name] + '<BR>To: '
        temphtml += stationdata[stationid["rid"]][name] + '<BR>Dist: '
        temphtml += stationid["dis"] + ' km Time: ' + stationid["time"] + ' min'
        document.getElementById("infoboard").innerHTML = temphtml
    }

    if (mode == 'station') {

        let temphtml = stationdata[stationid][name] + '<BR>'
        temphtml += stationdata[stationid][address] + '<BR>'

        if (stationdata[stationid][city].length > 1) {
            temphtml += stationdata[stationid][city]
        }
        else {
            temphtml += helsinki
        }
        if (whichtextfield == 2) { document.getElementById("infoboard3").innerHTML = temphtml }
        else { document.getElementById("infoboard").innerHTML = temphtml }

    }

}


function stationTripView2() {
    // initializes the screen to trip view operations and fetches the data
    stationview = -1
    stacknHide(['stationvstrip', 'stationvstrip2', 'menutitle', 'departure_dropdown', 'return_dropdown'], 1, ['filterStations', 'menutitleb', 'infoboard', 'infoboard3', 'closemap', 'stationdetailsFrom', 'stationdetailsTo', 'stationdetailsFrom2', 'stationdetailsTo2', 'map-container'])
    document.getElementById("currentdate").style.cursor = "pointer"
    document.getElementById("currentdate").style.opacity = 1;

    document.getElementById('stationvstrip').style.backgroundColor = '#ffffff'
    document.getElementById('stationvstrip2').style.backgroundColor = '#eeeeee'

    var dates = document.getElementById("currentdate").innerHTML.split('.')
    var datestr = dates[2].toString() + '-' + dates[1].toString().padStart(2, '0') + '-' + dates[0].toString().padStart(2, '0')
    getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + datestr, 3)

}


function stationTripView() {
    // initializes the screen to station view operations
    stationview = 1
    stacknHide(['stationvstrip', 'stationvstrip2', 'filterStations', 'menutitleb'], 1, ['menutitle', 'departure_dropdown', 'return_dropdown', 'infoboard', 'infoboard3', 'closemap', 'stationdetailsFrom', 'stationdetailsTo', 'stationdetailsFrom2', 'stationdetailsTo2', 'map-container'])
    document.getElementById("currentdate").style.cursor = "default"
    document.getElementById("currentdate").style.opacity = 0.4;
    document.getElementById('stationvstrip2').style.backgroundColor = '#ffffff'
    document.getElementById('stationvstrip').style.backgroundColor = '#eeeeee'
    update2stations(stationdata)
}


