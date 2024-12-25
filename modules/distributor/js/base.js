const hoverInfo = document.querySelector('#sj-hover-info');
const hoverIcons = document.querySelectorAll('.sj-info');
hoverIcons.forEach((icon) => {
    icon.addEventListener('mouseover', (e) => {
        hoverInfo.style.display = 'block';
        hoverInfo.innerText = icon.getAttribute('data-info-text') || 'No Info';
        const rect = icon.getBoundingClientRect();
        const belowPosition = rect.bottom + hoverInfo.offsetHeight;
        const rightPosition = rect.right + hoverInfo.offsetWidth;
        if(belowPosition > window.innerHeight){
            hoverInfo.style.top = (window.scrollY + rect.y - hoverInfo.offsetHeight - 5) + 'px';
        }else{
            hoverInfo.style.top = (window.scrollY + rect.y + rect.height + 5) + 'px';
        }
        if(rightPosition > window.innerWidth){
            hoverInfo.style.left = (window.scrollX + rect.x - hoverInfo.offsetWidth) + 'px';
        }
        else{
            hoverInfo.style.left = (window.scrollX + rect.x + rect.width) + 'px';
        }
    });
    icon.addEventListener('mouseout', () => {
        hoverInfo.style.display = 'none';
    });
});


function initDataTable(querySelector,buttonList=[],tableOptions={}) {
    $(document).ready(function() {
        $(querySelector).DataTable({
            "lengthChange": false,
            "ordering": false,
            "pageLength":10,
            ...tableOptions
        });
        const th = document.querySelectorAll(`${querySelector} thead th`);
        th.forEach((el) => {
            el.innerText = el.innerText.replaceAll('_',' ').replaceAll('-',' ');
            if(el.innerText.length < 4){
                el.innerText = el.innerText.toUpperCase();  
            }
        });
        $(`${querySelector}_wrapper .dt-search label`).hide();
        $(`${querySelector}_wrapper .dt-search input`).attr('placeholder', 'Search');
        const dtLayoutStart = document.querySelector(`${querySelector}_wrapper .dt-layout-start`);
        for(let i of buttonList){
            dtLayoutStart.appendChild(i);
            if(typeof i.inserted === 'function') i.inserted();
        }
    });
}
function createTableModalTrigger(name,modalQuery,options={}){
    const btn = createButton(name,options);
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', modalQuery);
    return btn;
}
function createButton(name,{className="",onClick,listeners=[]}= {}){
    const btn = document.createElement('button');
    btn.innerText = name;
    if(onClick){
        btn.addEventListener('click',onClick);
    }
    for(let listener of listeners){
        btn.addEventListener(listener.type,listener.callback);
    }
    btn.className = className || 'btn btn-primary btn-sm';
    return btn;
}



function createForm({children=[],action='/',method='GET',listener}){
    const container = document.createElement('form');
    if (listener)container.addEventListener('submit',listener);

    container.method = method;
    container.action = action;
    container.className = 'd-flex align-items-end flex-grow-1';
    container.style.gap = '8px';
    children.forEach((child) => {
        container.appendChild(child);
    });
    function inserted(){
        for(let child of children){
            if(typeof child.inserted === 'function') child.inserted();
        }
    }
    container.inserted = inserted;
    container.appendChild(createButton('Apply',{className:'btn btn-primary btn-sm'}));
    return container;
}


function createDropDown(labelText,name,items,{value,listener}={}){
    const label = document.createElement('label');
    const dropdown = document.createElement('select');
    label.className = 'small';
    label.innerText = labelText;
    label.htmlFor = name;
    dropdown.setAttribute('id',name);
    dropdown.addEventListener('change',listener);
    dropdown.name = name;
    items.forEach((item,ind) => {
        const option = document.createElement('option');
        option.value = item.value || item.text;
        option.text = item.text || item.value;
        option.dataset = item.dataset;
        option.dataset.optionIndex = ind;
        dropdown.appendChild(option);
    });
    function inserted(){
        dropdown.style.width = '100%';
        if(value){
            dropdown.value = value;
        }
    }
    const div = document.createElement('div');
    div.appendChild(label);
    div.appendChild(dropdown);
    div.inserted = inserted;
    return div;
}


function find(querySelector,all=false){
    if(all){
        return Array.from(document.querySelectorAll(querySelector));
    }
    return document.querySelector(querySelector);
}

function createSearchableDropdown({querySelector,searchQuerySelector,items,allowNA=false,NAVal=undefined,allowDuplicates=false,onItemClick=null,onTextChange=null}) {
    const dropdown = document.querySelector(querySelector);
    const dropDownSearchElements = Array.from(document.querySelectorAll(searchQuerySelector));
    let activeSearchElement = dropDownSearchElements[0];
    let activeSearchElementIndex = 0;
    const selectedItems = new Set();
    const filledSearchElements = new Map();    
    let itemInd = -1;
    if(allowNA){
        items.push({text:'N/A',value:NAVal});
    }
    const dropDownItems = items.map( ({text,value},itemIndex) => {
        const item = document.createElement('button');
        item.innerText = text;
        item.value = text;
        item.classList.add('dropdown-items');
        item.style.display = 'none';
        dropdown.appendChild(item);
        item.addEventListener('click', () => {
            activeSearchElement.value = item.value;
            if(!allowDuplicates){
                filledSearchElements.delete(activeSearchElementIndex);
                filledSearchElements.set(activeSearchElementIndex,itemIndex);
                selectedItems.add(itemIndex);
            }
            hideDropDown();
            if(onItemClick)onItemClick(value,activeSearchElement);
        });
        return item;
    });
    let filteredList = dropDownItems;
    function setDropdownItemsDisplay(items,display){
        filteredList = items;
        itemInd = -1;
        items.forEach( (item) => {
            item.style.display = display;
        });
    }
    function showDropDown(){
        if(dropdown.style.display !== 'block')dropdown.style.display = 'block';
    }
    function hideDropDown(){
        if(dropdown.style.display !== 'none')dropdown.style.display = 'none';
    }
    function setDropdownPosition(){
        dropdown.style.width = activeSearchElement.offsetWidth + 'px';
        const rect = activeSearchElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow > dropdown.offsetHeight) {
            dropdown.style.top = rect.bottom + 5 + 'px';
            dropdown.style.left = rect.left + 'px';
        } else {
            dropdown.style.top = (rect.top - dropdown.offsetHeight - 5) + 'px';
            dropdown.style.left = rect.left + 'px';
        }
    }

    dropDownSearchElements.forEach( (element,ind) => {
        element.addEventListener('click', () => {
            activeSearchElement = element;
            activeSearchElementIndex = ind;
            showDropDown();            
            setDropdownPosition();
            setDropdownItemsDisplay(dropDownItems,'none');
            let unselected = dropDownItems;
            if(!allowDuplicates){
                unselected = dropDownItems.filter((item,ind)=> !selectedItems.has(ind) || item.innerText == "N/A");
            }
            setDropdownItemsDisplay(unselected,'block');
        });
    });

    dropDownSearchElements.forEach( (element) => {
        element.addEventListener('input', () => {
            if(onTextChange)onTextChange(element);
            const selectedItemIndex = filledSearchElements.get(activeSearchElementIndex);
            if(selectedItemIndex !== undefined){
                filledSearchElements.delete(activeSearchElementIndex);
                selectedItems.delete(selectedItemIndex);
            }

            const search = element.value.toLowerCase().trim();
            filledSearchElements.delete(element);
            showDropDown();            
            setDropdownPosition();
            setDropdownItemsDisplay(dropDownItems,'none');
            let unselected = dropDownItems;
            if(!allowDuplicates){
                unselected = dropDownItems.filter((item,ind)=> !selectedItems.has(ind) || item.innerText == "N/A");
            }
            const filteredDropdown = unselected.filter((item)=> item.innerText.toLowerCase().trim().includes(search));
            setDropdownItemsDisplay(filteredDropdown,'block');
        });
    });



    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target) && !dropDownSearchElements.includes(event.target)) {
            dropdown.style.display = 'none';
        }
    });
    window.addEventListener('resize',function(){
        if(dropdown.style.display === 'block'){
            setDropdownPosition();
        }
    });
    dropdown.parentElement.addEventListener('scroll',function(){
        hideDropDown();
    });
    document.addEventListener('keydown', (event) => {
        if(dropdown.style.display === 'none')return;    
        if(event.key === 'ArrowDown'){
            if(itemInd !== -1){
                filteredList[itemInd].classList.remove('dropdown-items-active');
            }
            itemInd = Math.min(itemInd + 1,filteredList.length - 1);
            filteredList[itemInd].classList.add('dropdown-items-active');
            filteredList[itemInd].scrollIntoView({ block: 'nearest' });
        }
        else if(event.key === 'ArrowUp'){
            if(itemInd !== -1){
                filteredList[itemInd].classList.remove('dropdown-items-active');
            }
            itemInd = Math.max(itemInd - 1, 0);
            filteredList[itemInd].classList.add('dropdown-items-active');
            filteredList[itemInd].scrollIntoView({ block: 'nearest' });
        }
        else if(event.key === 'Enter'){
            filteredList[itemInd].classList.remove('dropdown-items-active');   
            filteredList[itemInd].click();
        }
        else if(event.key === 'Escape'){
            filteredList[itemInd].classList.remove('dropdown-items-active');
            hideDropDown();
        }
    });
    
    
    return dropdown;
}