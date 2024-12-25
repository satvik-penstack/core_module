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

const dataBtns = document.querySelectorAll('.data-btn');
dataBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        Array.from(btn.attributes).forEach(attr => {
            if (attr.name.startsWith('sj-')) {
                const name = attr.name.substring(3);
                const input = document.querySelector(`#${name}`);
                if(input){
                    input.value = attr.value;
                }
            }
        });
    });
});

function initDataTable(querySelector,buttonList=[],tableOptions={},gap=0) {
    $(document).ready(function() {
        $(querySelector).DataTable({
            "lengthChange": false,
            "ordering": false,
            "pageLength":10,
            ...tableOptions,
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
        dtLayoutStart.classList.add(`gap-${gap}`);
        for(let i of buttonList){
            dtLayoutStart.appendChild(i);
        }
    });
}
function createParagraph(text,className=''){
    const para = document.createElement('p');
    para.innerText = text;
    para.className = className;
    return para;
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
    container.className = 'd-flex align-items-end';
    container.style.gap = '8px';
    children.forEach((child) => {
        container.appendChild(child);
    });
    container.appendChild(createButton('Apply',{className:'btn btn-primary btn-sm'}));
    return container;
}

function createDropDown(labelText,name,items,{value='',listener}={}){
    const label = document.createElement('label');
    const dropdown = document.createElement('select');
    dropdown.setAttribute('id',name);
    label.setAttribute('for',name);
    label.innerText = labelText;
    label.className = 'text-sm';
    dropdown.value = value;
    dropdown.name = name;
    dropdown.addEventListener('change',listener);
    items.forEach((item,ind) => {
        const option = document.createElement('option');
        option.value = item.value || item.text;
        option.text = item.text || item.value;
        option.dataset = item.dataset;
        option.dataset.optionIndex = ind;
        dropdown.appendChild(option);
    });
    const div = document.createElement('div');
    div.appendChild(label);
    div.appendChild(dropdown);
    return div;
}

function find(querySelector,all=false){
    if(all){
        return Array.form(document.querySelectorAll(querySelector));
    }
    return document.querySelector(querySelector);
}

function createSearchableDropdown({querySelector,searchQuerySelector,items,allowNA=false,allowDuplicates=false}) {
    const dropdown = document.querySelector(querySelector);
    console.log(dropdown);
    const dropDownSearchElements = Array.from(document.querySelectorAll(searchQuerySelector));
    let activeSearchElement = dropDownSearchElements[0];
    function setDropdownItemsDisplay(items,display){
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
    const dropDownItems = items.map( (value) => {
        const item = document.createElement('button');
        item.innerText = value;
        item.value = value;
        item.classList.add('dropdown-items');
        item.style.display = 'none';
        dropdown.appendChild(item);
        item.addEventListener('click', () => {
            activeSearchElement.value = item.value;
            hideDropDown();
        });
        return item;
    });
   

    dropDownSearchElements.forEach( (element) => {
        element.addEventListener('input', () => {
            const search = dropDownSearchElements.value.toLowerCase().trim();
            if (search === '') {
                hideDropDown();
                return;
            }
            setDropdownItemsDisplay(dropDownItems,'none');
            let unselected = dropDownItems;
            if(!allowDuplicates){
                unselected = dropDownItems.filter((item)=> item.innerText == "N/A" || dropDownSearchElements.map((val)=>val.value).indexOf(item.innerText) === -1);
            }
            const filteredDropdown = unselected.filter((item)=> item.innerText.toLowerCase().trim().includes(search));
            setDropdownItemsDisplay(filteredDropdown,'block');
        });
    });

    dropDownSearchElements.forEach( (element) => {
        element.addEventListener('click', () => {
            activeSearchElement = element;
            showDropDown();            
            setDropdownPosition();
            setDropdownItemsDisplay(dropDownItems,'none');
            let unselected = dropDownItems;
            if(!allowDuplicates){
                unselected = dropDownItems.filter((item)=> item.innerText == "N/A" || dropDownSearchElements.map((val)=>val.value).indexOf(item.innerText) === -1);
            }
            setDropdownItemsDisplay(unselected,'block');
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
    return dropdown;
}