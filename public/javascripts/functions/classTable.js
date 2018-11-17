class _Table {
	constructor(elementId){
		this.originalData={};
		this.elementId=elementId;
	}
	create(obj){
		this.originalData=obj;
		let table=document.getElementById(obj.name);
		table.className="table table-sm table-hover";
		let thead=table.tHead;
		let tbody=table.tBodies[0];
		let tfoot=table.tFoot;

		// thead.className="thead-dark";
	

		tfoot.innerHTML=`<input type='hidden' id='data_${obj.name}' value='${(stringToBase64(JSON.stringify(obj)))}'>`;
		
		// Fejléc összeállítása
		obj.columns.forEach(column => {
			let c=column[0];
			let th=document.createElement('th');
			let span=document.createElement('span');
			span.innerHTML=(c.hasOwnProperty('head'))?c.head:'';

			//Rendezés
			if(c.hasOwnProperty('order')){
				if(c.order==true){
					let elementId=this.elementId;
					let od=this.originalData;
					span.id=`span_${obj.name}_${c.field}`
					span['onclick']=function(){
						let className=this.id.replace('span','class');
						let e=document.getElementById(elementId).tBodies[0];
						console.log(c);
						for(let i=e.rows.length-1;0<i;i--){
							for(let j=0;j<i;j++){
								if (c.order=="desc"){
									if(e.rows[j].getElementsByClassName(className)[0].value.toUpperCase()<e.rows[j+1].getElementsByClassName(className)[0].value.toUpperCase()){
										e.insertBefore(e.rows[j+1],e.rows[j]);
									}
								} else {
									if(e.rows[j].getElementsByClassName(className)[0].value.toUpperCase()>e.rows[j+1].getElementsByClassName(className)[0].value.toUpperCase()){
										e.insertBefore(e.rows[j+1],e.rows[j]);
									}
								}
							}
						}
						c.order=(c.order=="desc"?"asc":"desc");
					};
				};
			};
			th.appendChild(span);

			//Szűrő elemeinek összeállítása
			if (c.hasOwnProperty('filter')){
				switch (c.filter){
					case 'select':
						let div=document.createElement('div');
						let select= `<br><select id='head_${obj.name}_${c.field}'><option></option>`
						let values=[];
						obj.data.forEach(row=>{
							if(values.filter(v=>v==row[c.field]).length==0){
								values.push(row[c.field].toString().toLowerCase());
							}
						});
						values.sort().forEach(v=>{
							select += `<option>${v}</option>`;
						})

						div.innerHTML += `${select}</select>`;
						th.appendChild(div);
						break;
				}
			};
			thead.appendChild(th);
		});

		// Adatok betöltése sorokba
		obj.data.forEach(row => {
			let uniqueRowId=this.addRow({table:obj.name,position:0,data:row});
			row['uniqueRowId']=uniqueRowId;
		});
		this.originalData=obj;

		// Esemény beállítása a Szűrőhöz
		obj.columns.forEach(column => {
			let c=column[0];
			if (c.hasOwnProperty('filter')){
				document.getElementById(`head_${obj.name}_${c.field}`).onchange=function(){
					let className=`class_${obj.name}_${c.field}`;
					Array.from(document.getElementsByClassName(className)).forEach(e=>{
						e.parentElement.parentElement.style.display=
							(e.value==((this.selectedIndex==0)?e.value:this.value))
								?'table-row'
								:'none';
					});
				};
			};
		});
		
	}
	addRow(obj){
		var position=obj.position
		var data=obj.data
		// Egy új sort szúr be a megadott táblába
		// position (0: végére; x: adott sor elé;)

		var table=document.getElementById(this.elementId);
		var tbody=table.tBodies[0];
		var originalData = this.originalData;
		var columns = originalData.columns;
		var tr = document.createElement('tr');
		tr.innerHTML="";
		columns.forEach(column => {
			var c=column[0];
			var td=document.createElement('td');
			var value=(data.hasOwnProperty(c.field)) ? data[c.field] : '';
			var style=(c.style) ? c.style : '';
			var id=(c.id) ? c.id : '';
			var label=(c.label) ? c.label : '';
			var class_=`class_${this.elementId}_${c.field}`;

			switch (c.type) {
				case 'text':
					td.innerHTML = `<input type='text' class='${class_}' value='${value}' style='${style}'>`;
					break;
				case 'button':
					td.innerHTML = `<input type='button' class='${class_}' value='${label}' style='${style}'>`;
					break;
				case 'hidden':
					td.innerHTML = `<input type='hidden' class='${class_}' id='${id}' value='${value}'>`;
					break;
				default:
					td.innerHTML = `${value}`;
					break;
			}
			// Esemény hozzáadása a cella eleméhez
			for (const event in c.event) {
				td.firstChild[event] = c.event[event];
			};
			tr.appendChild(td);

			// Esemény hozzáadása a sorhoz                
			for (const event in originalData.rowEvents) {
				tr[event]=originalData.rowEvents[event];
			};
		});
		var uniqueRowId = 'id-' + Math.random().toString(36).substr(2, 16);
		tr.id = `${uniqueRowId}`;   

		// Új sor beszúrása az adott helyre
		if (position==0) {
			tbody.appendChild(tr);
		} else {
			tbody.insertBefore(tr, tbody.childNodes[position-1]);
		}
		return uniqueRowId;                
	}
	getData(){
		var table=document.getElementById(this.elementId);
		var tbody=table.tBodies[0];
		// var originalData = JSON.parse(stringFromBase64(table.tFoot.firstChild.value));
		var originalData = this.originalData;
		// console.log(originalData);
		var columns = originalData.columns;
		var data=[];

		for (let i = 0; i < tbody.rows.length; i++) {
			const row = tbody.rows[i];
			let rowData={};
			for (let j = 0; j < row.cells.length; j++){
				const cell = row.cells[j];
				var column = columns[j][0];
				switch (column.type) {
					case 'text':
						rowData[column.field]=cell.firstChild.value
						break;
					case 'button':
						break;
					case 'hidden':
						rowData[column.field]=cell.firstChild.value
						break;
				}
			}
			rowData['uniqueRowId']=row.id;
			data.push(rowData);
		}
		return data;
	}
	getChanges(){
		let originalData = this.originalData.data;
		let actualData= this.getData();
		let data={
			changed:[],
			new:[],
			deleted:[]
		}
		for (let i=0;i<actualData.length;i++){
			// Keresés az eredeti táblában uniqueRowId alapján
			let originalRow=originalData.filter(x=>x.uniqueRowId==actualData[i].uniqueRowId);
			
			if (originalRow.length==0){
				// Ha nincs találat, akkor új sorról van szó
				let rowData={};
				for (const key in actualData[i]) {
					if(key!='uniqueRowId'){
						rowData[key]=actualData[i][key]
					}
				}                        
				data.new.push(rowData);                        
			} else {
				// Van az eredeti táblában, megnézzük hogy változott-e valamelyik érték
				let changed=false;
				for (const key in actualData[i]) {
					if (originalRow[0][key].toString()!==actualData[i][key]){
						changed=true;
					}
				}
				if (changed==true){
					let rowData={};
					for (const key in actualData[i]) {
						if(key!='uniqueRowId'){
							rowData[key]={
								'original':originalRow[0][key].toString(),
								'actual':actualData[i][key]
							}
						}
					}                        
					data.changed.push(rowData);
				}
			}
		}

		// Törölt sorok összegyűjtése
		for (let i=0;i<originalData.length;i++){
			if (actualData.filter(x=>x.uniqueRowId==originalData[i].uniqueRowId).length==0){
				let rowData={};
				for (const key in actualData[i]) {
					if(key!='uniqueRowId'){
						rowData[key]=actualData[i][key]
					}
				}                        
				data.deleted.push(rowData);                        
			}
		}
		return data;
	}
}