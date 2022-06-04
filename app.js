var blueIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var goldIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var redIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var greenIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var orangeIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var yellowIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var violetIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var greyIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var blackIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var map;
function create_map(la=24.7854333, ln=120.999092) {
  console.log(la);
  console.log(ln);
  map = L.map('map').setView([la, ln], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
    maxZoom: 18,
  }).addTo(map);
}

function add_marker(la, ln) {
  var marker;
  marker = L.marker([la, ln]);
  marker.addTo(map);
}

function change_modal_content(code) {

}

function markerOnClick(e) {
  console.log(e);
}

//const dir_tag_text = 'direction in Google map.';//'在Google地圖中導航';
const dir_tag_text = '在Google地圖中導航';
var markers = {};
function add_store_marker(store, store_stock_data) {
  //console.log(store_stock_data);
  stock = store_stock_data.stock;
  let icon;
  if (stock > 58) icon = greenIcon;
  else if (stock >= 39) icon = yellowIcon;
  else if (stock >= 20) icon = goldIcon;
  else if (stock > 0) icon = redIcon;
  else icon = greyIcon;
  //console.log(stock, icon);
  var marker = L.marker([store.la, store.ln], {
    icon: icon,
    title: store.name
  }).addTo(map);
  let popup_content = `<h5>${store.name}</h5><div>存貨: ${store_stock_data.stock}</div>
    <div>更新時間: ${store_stock_data.time}</div>
    <div>
      <p>
      備註:
        ${store_stock_data.memo}
      </p>
    </div>
    <div onclick=window.open('https://www.google.com.tw/maps/dir/${cur_la},${cur_ln}/${store.name}+${store.addr}/@${store.la},${store.ln},14.75z')>${dir_tag_text}</div>`
  marker.bindPopup(popup_content);//.openPopup();
  markers[store.code] = marker;
}


function get_real_dist(s_la, s_ln, f_la, f_ln) {
  //let osrm_url = `https://router.project-osrm.org/route/v1/foot/${s_ln},${s_la};${f_ln},${f_la}?overview=false`;
  let osrm_url = `https://nycu.cslife.cf:9999/get_real_dist`;
  return axios.get(osrm_url, {params: {s_la: s_la, s_ln: s_ln, f_la: f_la, f_ln: f_ln}});
}



var stores_stock_data;
var tmp;
function pin_sites(data) {
  //all stores stock
  let stores_code = data.map(x=>x.code);
  axios.get('https://nycu.cslife.cf:9999/get_stocks', {params: {stores_code: JSON.stringify(stores_code)}})
    .then(function (response) {
      stores_stock_data = response.data;
      //console.log(stores_stock_data);
    });
  //for each store, get stock
  data.forEach(function(store) {
    axios.get('https://nycu.cslife.cf:9999/get_stock', {params: {store_code: store.code}})
      .then(function (response) {
        let store_stock_data = response.data;
        //console.log(store_stock_data);
        add_store_marker(store, store_stock_data);
      })
      .catch(function (error) {console.log(error);});
  });
}

function createTable(content, header=[], selector='body', row_attrs={}, indv_row_attrs={}) {
  var table = document.createElement('table');
  table.setAttribute('class', 'bs_table');
  var tableBody = document.createElement('tbody');
  // create header
  if (header) {
    var col_names = document.createElement('thead');
    //col_names.setAttribute('id', 'header');
    header.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      col_names.appendChild(cell);
    });
    table.appendChild(col_names);
  }
  // create rows
  //content.forEach(function(rowData) 
  for (let i = 0; i < content.length; i++){
    var rowData = content[i];
    var row = document.createElement('tr');
    // set row attributes
    for (const[key, val] of Object.entries(row_attrs)) {
      row.setAttribute(key, val);
    }
    // set individual row attributes
    for (const[key, vals] of Object.entries(indv_row_attrs)) {
      row.setAttribute(key, vals[i]);
    }
    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  }
  //});
  table.appendChild(tableBody);
  console.log(document.querySelector(selector));
  document.querySelector(selector).appendChild(table);
  $('.bs_table').bootstrapTable();
}

function tr_onclick(store_code) {
  let marker = markers[store_code];
  map.flyTo(marker.getLatLng());
  marker.openPopup();
}

var stores_info;
var real_dists = {};
function adj_process(response) {
  stores_info = response.data;
  pin_sites(stores_info); //get stores_stock_data
  //header: name dist
  //selector: .list_wrapper
  //indv_row_attrs: onclick click_row_function
  header = ['醫事機構名稱', '實際距離 (公尺)'];
  selector = "#list_wrapper";
  indv_row_attrs = {'onclick': stores_info.map(s => `tr_onclick('${s.code}');`)};
  content = [];//name, real_dist
  let dist_promieses = [];
  //get real dists
  stores_info.forEach(function(store) {
    dist_promieses.push(get_real_dist(cur_la, cur_ln, store.la, store.ln)
      .then(response => {real_dists[store.code] = response.data; console.log(store.code, response.data);}));
  });
  //until getting all real dist, create table.
  Promise.all(dist_promieses).then(function (foo) {
    stores_info.forEach(s=>{content.push([s.name, real_dists[s.code]])});
    content.sort((a, b) => a[1]-b[1]);
    createTable(content, header=header, selector=selector, row_attrs={}, indv_row_attrs=indv_row_attrs);
  });
}

var cur_la;
var cur_ln;
function fetch_data(req_data) {
  cur_la = req_data.coords.latitude;
  cur_ln = req_data.coords.longitude;
  //console.log(req_data);
  axios.get('https://nycu.cslife.cf:9999/adj_store_data', { params: {latitude: cur_la, longitude: cur_ln, limit: 30, hdist: 10}})
    .then(adj_process)
    .catch(function (error) {console.log(error);});
}

function geo_callback(geo_data) {
  create_map(geo_data.coords.latitude, geo_data.coords.longitude);
  var data = fetch_data(geo_data);
}
navigator.geolocation.getCurrentPosition(geo_callback);
