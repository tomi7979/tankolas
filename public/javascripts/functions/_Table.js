/* 
Paraméter objektum felépítése: 
	name:		Tábla neve
	data:		Adatok json formátumban
	editable:	Alapértelmezetten false, azt jelenti, hogy a táblázat értékei módosíthatóak-e
		true:		Módosíthatóak az értékek
	editBy:		Szerkesztés kezdeményezése
		rowClick:	Sorra kattintással
		iconClick:	Az első oszlopban toll ikon
	columns:	Oszlopok paraméterezése tömbben
		head:		Oszlop neve megjelenítve
		field:		Oszlop neve a data-ban
		type:		Oszlop típusa
			text		Szöveg	input type=text
			button		Gomb	input type=button
			hidden		Rejett	input type=hidden
			Nincs megadva	Csak szöveg
		style:		Oszlop egyedi stílusa
		order:		Rendezés
			true		Rendezés bekapcsolása
		filter:		Szűrő
			"select"	Lenyíló lista
		event:		Esemény az oszlop összes cellájára 
			{
				onclick: 		someFunction
				onmouseover:  	function(){console.log('elemover')}
			}
		label:		Gomb felirat
	rowEvents:	Minden sorra rákerül az itt megadott esemény
	deleteRow:	A sor előtt megjelentik egy törlés gomb
		true: 

*/
var allTable=[];
function _Table(obj){
	this.originalData	=obj;
	this.elementId		=obj.elementId;
	this.underEditing	=false;
};
_Table.prototype.create=function (obj){
	this.underEditing	=false;
	let table			=document.getElementById(obj.elementId);
	let thead			=table.tHead;
	let tbody			=table.tBodies[0];
	let tfoot			=table.tFoot;
	table.className		="table table-sm table-hover";

	tfoot.innerHTML=`<input type='hidden' id='data_${obj.name}' value='${(stringToBase64(JSON.stringify(obj)))}'>`;
	// className beállítása az oszlopokhoz
	obj.columns.forEach(column => {
		column.className=`class_${obj.name}_${column.field}`;
	});

	// Fejléc összeállítása
	obj.columns.forEach(column => {
		let c			=column;
		let th			=document.createElement('th');
		let span		=document.createElement('span');
		span.innerHTML	=(c.hasOwnProperty('head'))?c.head:'';

		//Rendezés
		if(c.hasOwnProperty('order')){
			if(c.order==true){
				let elementId=this.elementId;
				let od=this.originalData;
				span.id=`span_${obj.name}_${c.field}`
				span['onclick']=function(){
					let className=this.id.replace('span','class');
					let e=document.getElementById(elementId).tBodies[0];
					// console.log(c);
					for(let i=e.rows.length-1;0<i;i--){
						for(let j=0;j<i;j++){
							if (c.order=="desc"){
								if(e.rows[j].getElementsByClassName(className)[0].innerText/* .toUpperCase() */<e.rows[j+1].getElementsByClassName(className)[0].innerText/* .toUpperCase() */){
									e.insertBefore(e.rows[j+1],e.rows[j]);
								}
							} else {
								if(e.rows[j].getElementsByClassName(className)[0].innerText/* .toUpperCase() */>e.rows[j+1].getElementsByClassName(className)[0].innerText/* .toUpperCase() */){
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
					let select= `<select id='head_${obj.name}_${c.field}'><option></option>`
					let values=[];
					obj.data.forEach(row=>{
						if(values.filter(v=>v.toString().toLowerCase()==row[c.field].toString().toLowerCase()).length==0){
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
	// Ha a táblázat szerkeszthető, plusz mező beszúrása a fejlécbe
	if(obj.hasOwnProperty('editRow') && obj.editRow){
		let th=document.createElement('th');
		thead.insertBefore(th,thead.firstChild);
		thead.insertBefore(th,thead.firstChild);
	};
	// Ha a táblázat sorai törölhetőek, plusz mező beszúrása a fejlécbe
	// if(obj.hasOwnProperty('deleteRow') && obj.deleteRow){
	// 	let th=document.createElement('th');
	// 	thead.insertBefore(th,thead.firstChild);
	// };

	// Adatok betöltése sorokba
	obj.data.forEach(row => {
		let uniqueRowId=this.addRow(this,0,row);
		row['uniqueRowId']=uniqueRowId;
	});
	// obj.data.forEach(row => {
	// 	let uniqueRowId=addRow({
	// 		table		:obj.name,
	// 		elementId	:obj.elementId,
	// 		position	:0,
	// 		data		:row,
	// 		editRow		:obj.editRow,
	// 		deleteRow	:obj.deleteRow,
	// 		columns		:obj.columns,
	// 		originalData:this.originalData
	// 	});
	// 	row['uniqueRowId']=uniqueRowId;
	// });
	this.originalData=obj;

	// Esemény beállítása a Szűrőhöz
	obj.columns.forEach(column => {
		if (column.hasOwnProperty('filter')){
			document.getElementById(`head_${obj.name}_${column.field}`).onchange=function(){
				Array.from(document.getElementsByClassName(column.className)).forEach(e=>{
					e.parentElement.parentElement.style.display=
						(e.innerText.toLowerCase()==((this.selectedIndex==0)?e.innerText.toLowerCase():this.value))
							?'table-row'
							:'none';
				});
			};
		};
	});
};
_Table.prototype.addRow=function(obj,position,data){
	// Egy új sort szúr be a megadott táblába
	// position (0: végére; x: adott sor elé;)
	let table		=document.getElementById(obj.elementId);
	let tbody		=table.tBodies[0];
	let originalData=obj.originalData;
	let columns 	=originalData.columns;
	let tr 			=document.createElement('tr');
	tr.innerHTML	="";
	
	columns.forEach(column => {
		let td		=document.createElement('td');
		let value	=(data.hasOwnProperty(column.field)) ? data[column.field] : '';
		let style	=(column.style) ? column.style : '';
		let id		=(column.id) ? column.id : '';
		let label	=(column.label) ? column.label : '';
		let class_	=`class_${obj.elementId}_${column.field}`;

		switch (column.type) {
			default:
				td.innerHTML = `<span class='${class_}' value='${value}'>${value}</span>`;
				break;
		}
		// Esemény hozzáadása a cella eleméhez
		for (const event in column.event) {
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

	// Ha a táblázat szerkeszthető, akkor esemény hozzáadása
	if(originalData.hasOwnProperty('editRow') && originalData.editRow){
		let td=document.createElement('td');
		td.innerHTML= '<i class="far fa-trash-alt"></i>';
		td.innerHTML+='<i class="fas fa-ban" style="display:none;color:red"></i>';
		td.childNodes[0].onclick=function(){deleteRowButtonClick(this,obj);};
		td.childNodes[1].onclick=function(){cancelButtonClick(this,obj);};
		tr.insertBefore(td,tr.firstChild);
		td=null;
		td=document.createElement('td');
		td.innerHTML= '<i class="fas fa-edit"></i>';
		td.innerHTML+='<i class="far fa-check-circle" style="display:none;color:green"></i>';
		td.childNodes[0].onclick=function(){editRowButtonClick(this,obj);};
		td.childNodes[1].onclick=function(){okButtonClick(this,obj);};
		tr.insertBefore(td,tr.firstChild);
	};
	function cancelButtonClick (e,obj){
		console.log(obj);
	};

	function editRowButtonClick (e,obj){
		if (obj.underEditing)
			{alert("Szerkesztés alatt van a táblázat")}
		else {
			obj.underEditing=true;
			let row=e.parentElement.parentElement;
			row.childNodes[0].firstChild.style.display="none";		//Szerkeszt gomb elrejtése
			row.childNodes[1].firstChild.style.display="none";		//Törlés gomb elrejtése
			row.childNodes[0].childNodes[1].style.display="inline";	//OK gomb megjelenítése
			row.childNodes[1].childNodes[1].style.display="inline";	//Mégsem gomb megjelenítése
			obj.originalData.columns.forEach(column => {
				let row=e.parentElement.parentElement;
				let td=row.getElementsByClassName(column.className)[0].parentElement;
				let span=td.firstChild;
				switch (column.type){
					case 'text':
						let tdStyle	=window.getComputedStyle(td);
						let width	=parseFloat(tdStyle.width)-parseFloat(tdStyle.paddingLeft)-parseFloat(tdStyle.paddingRight);
						let height	=parseFloat(tdStyle.height)-parseFloat(tdStyle.paddingTop)-parseFloat(tdStyle.paddingBottom);
						let style	=`width:${width}px;height:${height}px`;
						span.style.display='none';
						td.innerHTML += `<input type='text' value='${span.attributes["value"].value}' style='${style}'>`;
						break;
					case 'id':
						break;
				};
			});
		};
	};

	function okButtonClick (e,obj){
		let row=e.parentElement.parentElement;
		obj.originalData.columns.forEach(column => {						
			switch (column.type){
				case 'text':
					let td=row.getElementsByClassName(column.className)[0].parentElement;
					let span=td.firstChild;
					span.attributes["value"].value=td.childNodes[1].value;		//Módosított érték visszaírása a spanba
					span.innerText=span.attributes["value"].value;
					td.removeChild(td.childNodes[1]);							//Input eltávolítása
					td.firstChild.style.display='inline';						//Span megjelenítése
					break;
			};
		});
		row.childNodes[0].firstChild.style.display="inline";		//Szerkeszt gomb elrejtése
		row.childNodes[1].firstChild.style.display="inline";		//Törlés gomb elrejtése
		row.childNodes[0].childNodes[1].style.display="none";		//OK gomb megjelenítése
		row.childNodes[1].childNodes[1].style.display="none";		//Mégsem gomb megjelenítése
		obj.underEditing=false;
	};

	function cancelButtonClick (e,obj){
		let row=e.parentElement.parentElement;
		obj.originalData.columns.forEach(column => {						
			if (column.type!='id'){
				let td=row.getElementsByClassName(column.className)[0].parentElement;
				td.removeChild(td.childNodes[1]);					//Input eltávolítása
				td.firstChild.style.display='inline';				//Span megjelenítése
			};
		});
		row.childNodes[0].firstChild.style.display="inline";		//Szerkeszt gomb elrejtése
		row.childNodes[1].firstChild.style.display="inline";		//Törlés gomb elrejtése
		row.childNodes[0].childNodes[1].style.display="none";		//OK gomb megjelenítése
		row.childNodes[1].childNodes[1].style.display="none";		//Mégsem gomb megjelenítése
		obj.underEditing=false;
	}

	function deleteRowButtonClick (e,obj){
		let row=e.parentElement.parentElement;
		row.parentElement.removeChild(row);
	};

	// Új sor beszúrása az adott helyre
	if (position==0) {
		tbody.appendChild(tr);
	} else {
		tbody.insertBefore(tr, tbody.childNodes[position-1]);
	}
	return uniqueRowId;                
};
_Table.prototype.getData=function(){
	var table			= document.getElementById(this.elementId);
	var tbody			= table.tBodies[0];
	var originalData 	= this.originalData;
	var columns 		= originalData.columns;
	var data			= [];

	for (let i = 0; i < tbody.rows.length; i++) {
		let row = tbody.rows[i];
		let rowData={};
		columns.forEach(column => {
			let className=`class_${this.originalData.name}_${column.field}`;
			Array.from(row.getElementsByClassName(className)).forEach(e=>{
				switch (column.type) {
					// case 'text':
					// 	rowData[column.field]=cell.firstChild.value
					// 	break;
					// case 'button':
					// 	break;
					// case 'hidden':
					// 	rowData[column.field]=cell.firstChild.value
					// 	break;
					default:
					rowData[column.field]=e.attributes["value"].value
				}
			})
		});
		rowData['uniqueRowId']=row.id;
		data.push(rowData);
	}
	return data;
};
_Table.prototype.getChanges=function(){
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
};
_Table.prototype.addEmptyRow=function(){
	this.addRow(this,0,{});
};
