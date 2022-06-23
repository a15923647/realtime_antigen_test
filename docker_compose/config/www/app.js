let backend_loc = "nycu.cslife.cf";
let backend_port = 9999;
let blueIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let goldIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let redIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let greenIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let orangeIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let yellowIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let violetIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let greyIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let blackIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

let map;
function create_map(la=24.7854333, ln=120.999092) {
  map = L.map('map').setView([la, ln], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
    maxZoom: 24,
  }).addTo(map);
}

function add_marker(la, ln, icon=null, title=null, bind_title=null, bindTooltip=null, open_tooltip=false) {
  let marker;
  marker_options = new Object();
  if (icon) marker_options.icon = icon;
  if (title) marker_options.title = title;
  marker = L.marker([la, ln], marker_options);
  marker.addTo(map);
  let tt;
  if (bind_title) tt = marker.bindTooltip(bind_title, bindTooltip);
  if (open_tooltip) tt.openTooltip();
  return marker;
}

function add_pos_marker(la, ln, icon) {
  pos_marker = L.marker([la, ln], {icon: icon});
  pos_marker.addTo(map);
}

function remove_store(store_code) {
  console.log('remove ', store_code);
  map.removeLayer(markers[store_code]);
  document.querySelector(`#tr_${store_code}`).remove();
}

function select_proper_icon(stock) {
  let icon;
  if (stock > 58) icon = greenIcon;
  else if (stock >= 39) icon = yellowIcon;
  else if (stock >= 20) icon = goldIcon;
  else if (stock > 0) icon = redIcon;
  else icon = greyIcon;
  return icon;
}

const dir_tag_text = '在Google地圖中導航';
let markers = {};
function add_store_marker(store, store_stock_data) {
  if (!store_stock_data) {
    store_stock_data = new Object();
    store_stock_data.stock = -1;
    store_stock_data.time = 'unknown';
    store_stock_data.memo = 'unknown';
  }
  stock = (store_stock_data.stock || -1);
  let icon = select_proper_icon(stock);
  let marker = L.marker([store.la, store.ln], {
    icon: icon,
    title: store.name
  }).addTo(map).on('click', ( () => update_marker(store.code) ));
  let popup_content = `<h5>${store.name}</h5><div id="stock_tag_${store.code}">存貨: ${store_stock_data.stock}</div>
    <div id="update_time_${store.code}">更新時間: ${store_stock_data.time}</div>
    <div>
      <p id="memo_para_${store.code}">
      備註:
        ${store_stock_data.memo}
      </p>
    </div>
    <div onclick=window.open('https://www.google.com.tw/maps/dir/${cur_la},${cur_ln}/${store.name}+${store.addr}/@${store.la},${store.ln},14.75z')>${dir_tag_text}</div>
    <button onclick="show_history(${store.code});" data-bs-toggle="modal" data-bs-target="#historyModal">顯示趨勢圖</button>
    <button onclick="remove_store(${store.code});">移除釘選</button>
    `
  marker.bindPopup(popup_content);//.openPopup();
  markers[store.code] = marker;
  return marker;
}

function update_marker(store_code) {
  console.log("update marker", store_code2info[store_code].name);
  axios.get(`https://${backend_loc}:${backend_port}/get_stocks`, {params: {stores_code: JSON.stringify([store_code])}})
    .then(function (response) {
      store = store_code2info[store_code]
      store_stock_data = response.data[store.code];
      stock = (store_stock_data.stock || -1);
      let icon = select_proper_icon(stock);
      markers[store.code].setIcon(icon);
      markers[store.code]._popup.setContent(`<h5>${store.name}</h5><div id="stock_tag_${store.code}">存貨: ${store_stock_data.stock}</div>
          <div id="update_time_${store.code}">更新時間: ${store_stock_data.time}</div>
          <div>
            <p id="memo_para_${store.code}">
            備註:
              ${store_stock_data.memo}
            </p>
          </div>
          <div onclick=window.open('https://www.google.com.tw/maps/dir/${cur_la},${cur_ln}/${store.name}+${store.addr}/@${store.la},${store.ln},14.75z')>${dir_tag_text}</div>
          <button onclick="show_history(${store.code});" data-bs-toggle="modal" data-bs-target="#historyModal">顯示趨勢圖</button>
          <button onclick="remove_store(${store.code});">移除釘選</button>
        `);
    });
}

let stores_stock_data;
let stores_code;
function pin_sites(data) {
  //all stores stock
  stores_code = data.map(x=>x.code);
  axios.get(`https://${backend_loc}:${backend_port}/get_stocks`, {params: {stores_code: JSON.stringify(stores_code)}})
    .then(function (response) {
      document.querySelector('.bs_spinner_container').style.display="block";
      stores_stock_data = response.data;
      data.forEach(function(store) {
        add_store_marker(store, stores_stock_data[store.code] || {});
      });
      setTimeout(() => document.querySelector('.bs_spinner_container').style.display="none");
    });
}

function render_chart(data, label='快篩數量', canvas_id='chartCanvas', container_id='chartContainer') {
  let canvas = document.getElementById(canvas_id);
  let container = document.getElementById(container_id);
  canvas.remove();
  let new_canvas = document.createElement('canvas');
  new_canvas.setAttribute('id', canvas_id);
  //new_canvas.setAttribute('width', "400");
  //new_canvas.setAttribute('height', "400");
  container.appendChild(new_canvas);
  canvas = new_canvas;
  let ctx = canvas.getContext('2d');
  data_arr = data.map(x=>parseInt(x[0], 10));
  const labels = data.map(x=>x[1]);
  let chart_config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data_arr,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }
  };
  let chart = new Chart(ctx, chart_config);
}

let last_access_history_code;
interval_strings = ['7 days', '3 days', '1 day', '1 hour']
function show_history(store_code) {
  last_access_history_code = store_code;
  document.querySelector('.bs_spinner_container').style.display="block";
  axios.get(`https://${backend_loc}:${backend_port}/get_interval_history`, {params: {store_code: store_code, interval: interval_strings[ document.querySelector("#interval_select").selectedIndex ]}})
    .then(function(response) {
      console.log(`show history of ${store_code2info[store_code].name}`);
      chart_data = response.data.map(x=>[x[0], x[1].replace(/^([0-9]{4})-/, x=>"")]);
      render_chart(chart_data);
      $('#historyModal').modal("show");
      document.getElementById('modal_org_name').innerHTML = store_code2info[store_code].name;
      document.querySelector('.bs_spinner_container').style.display="none";
    });
}

function createTable(content, header=[], selector='body', row_attrs={}, indv_row_attrs={}) {
  let table = document.createElement('table');
  table.setAttribute('class', 'bs_table');
  let tableBody = document.createElement('tbody');
  // create header
  if (header) {
    let col_names = document.createElement('thead');
    header.forEach(function(cellData) {
      let cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      col_names.appendChild(cell);
    });
    table.appendChild(col_names);
  }
  // create rows
  for (let i = 0; i < content.length; i++){
    let rowData = content[i];
    let row = document.createElement('tr');
    // set row attributes
    for (const[key, val] of Object.entries(row_attrs)) {
      row.setAttribute(key, val);
    }
    // set individual row attributes
    for (const[key, vals] of Object.entries(indv_row_attrs)) {
      row.setAttribute(key, vals[i]);
    }
    rowData.forEach(function(cellData) {
      let cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  }
  table.appendChild(tableBody);
  document.querySelector(selector).appendChild(table);
  $('.bs_table').bootstrapTable();
}

function tr_onclick(store_code) {
  let marker = markers[store_code];
  update_marker(store_code);
  map.flyTo(marker.getLatLng(), 17);
  marker.openPopup();
}

let stores_info = {};
let store_code2info = {};
let real_dists = {};
let real_d_content = [];
let real_d_header;
let real_d_selector;
let real_d_indv_row_attrs;
function adj_process(response) {
  stores_info = response.data;
  stores_info.forEach(function(store) {
    store_code2info[store.code] = store;
  });
  pin_sites(stores_info); //get stores_stock_data
  //header: name dist
  //selector: .list_wrapper
  //indv_row_attrs: onclick click_row_function
  header = ['醫事機構名稱', '實際距離 (公尺)'];
  selector = "#list_wrapper";
  
  content = [];//name, real_dist
  const osrm_url = `https://${backend_loc}:${backend_port}/get_real_dists`;
  const store_coords = stores_info.map(s => [s.la, s.ln]);
  axios.get(osrm_url, {params: {s_la: cur_la, s_ln: cur_ln, dsts: JSON.stringify(store_coords)}})
    .then(function(response) {
      let data = response.data;
      for (let i = 0; i < store_coords.length; i++) {
        real_dists[stores_info[i].code] = data[i];
      }
      let zipped_content = [];
      stores_info.forEach(s=>{zipped_content.push([s.code, s.name, real_dists[s.code]])});
      zipped_content.sort((a, b) => a[2]-b[2]);
      sorted_codes = zipped_content.map(x => x[0]);
      content = zipped_content.map(x => [x[1], x[2]]);
      real_d_content = content;
      indv_row_attrs = {
        'onclick': sorted_codes.map(s => `tr_onclick('${s}');`),
        'id': sorted_codes.map(s => `tr_${s}`)
      };
      real_d_header = header;
      real_d_selector = selector;
      real_d_indv_row_attrs = indv_row_attrs;
      createTable(content, header=header, selector=selector, row_attrs={}, indv_row_attrs=indv_row_attrs);
    });
}

function flyBack() {
  map.flyTo([cur_la, cur_ln], 14);
}

let limit = 400;
let hdist = 300;
function fetch_data(req_data) {
  let la = req_data.coords.latitude;
  let ln = req_data.coords.longitude;
  return axios.get(`https://${backend_loc}:${backend_port}/adj_store_data`, { params: {latitude: la, longitude: ln, limit: limit, hdist: hdist}})
    .then(adj_process)
    .catch(function (error) {console.log(error);});
}

function create_date_chart() {
  return axios.get(`https://${backend_loc}:${backend_port}/date_summary`)
    .then(function(response) {
      chart_data = response.data.map(x=>[x[0], x[1].replace(/^([0-9]{4})-/, x=>"")]);
      render_chart(chart_data, label='全台快篩餘量', canvas_id='date_sum_chart', container_id='date_summary_container');
    });
}

let cur_la;
let cur_ln;
let cur_marker;
function geo_callback(geo_data) {
  cur_la = geo_data.coords.latitude;
  cur_ln = geo_data.coords.longitude;
  create_map(cur_la, cur_ln);
  cur_marker = add_marker(cur_la, cur_ln, icon=blueIcon, title="現在位置", bind_title="現在位置", bindTooltip={permanent: true, direction: 'bottom'}, open_tooltip=true);
  let fetch_promise = fetch_data(geo_data);
  let date_sum_promise = create_date_chart();

}

function change_cur_pos_marker(loc_data) {
  const card = loc_data.coords;
  cur_la = card.latitude;
  cur_ln = card.longitude;
  const new_LatLng = new L.LatLng(cur_la, cur_ln);
  cur_marker.setLatLng(new_LatLng);
}
window.onload = navigator.geolocation.getCurrentPosition(geo_callback);
navigator.geolocation.watchPosition(change_cur_pos_marker);
