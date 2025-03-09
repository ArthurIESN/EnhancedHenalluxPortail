

let myPromotions = null;
let calendar = null;
let promotionContainer;
let promotionList;
let class_b1;
let class_b2;
let class_b3;
let class_other;
let calendarMessage;

getSelectedPromotions();

document.addEventListener('DOMContentLoaded', async function()
{
    class_b1 = document.getElementById('class_b1_container');
    class_b2 = document.getElementById('class_b2_container');
    class_b3 = document.getElementById('class_b3_container');
    class_other = document.getElementById('class_other_container');
    promotionContainer = document.getElementById('promotions-container');
    promotionList = document.getElementById('promotions-list');
    calendarMessage = document.getElementById('calendarMessage');

    SetupConditionOfUse();
    SetupColors();
    SetupPromotions();
    SetupSettings();
    //SetupModal();
    LoadCachedEvents();
    await LoadPromotions();
    await getMyEvents();
    setCalendarMessage();
    UpdateClasses();
});

let forceCalendarMessage = false;
function setCalendarMessage(message = "", force = forceCalendarMessage) {

    // if there is no message, hide the message
    if (message === "" && !forceCalendarMessage)
    {
        calendarMessage.style.display = 'none';
    }
    // if there is a message, show it
    else if(!forceCalendarMessage)
    {
        calendarMessage.style.display = 'block';
        calendarMessage.textContent = message;
    }

    forceCalendarMessage = force;
}

function SetupPromotions()
{
    const promotions = [{"id":"2-3491-4532","name":"IE-ASI-1M"},{"id":"2-3525-9014","name":"IE-ASI-1M-A"},{"id":"2-3528-9015","name":"IE-ASI-2M-A"},{"id":"2-2350-981","name":"IE-AU-1B-A"},{"id":"2-2351-989","name":"IE-AU-1B-B"},{"id":"2-2352-2826","name":"IE-AU-1B-C"},{"id":"2-2359-1058","name":"IE-AU-2B-A"},{"id":"2-2360-1059","name":"IE-AU-2B-B"},{"id":"2-2361-5399","name":"IE-AU-2B-C"},{"id":"2-2368-1136","name":"IE-AU-3B-A"},{"id":"2-2369-5037","name":"IE-AU-3B-B"},{"id":"2-2370-8557","name":"IE-AU-3B-C"},{"id":"2-2377-6321","name":"IE-CF-2B-A"},{"id":"2-2378-6322","name":"IE-CF-2B-B"},{"id":"2-2379-8086","name":"IE-CF-2B-C"},{"id":"2-2386-6326","name":"IE-CF-3B-A"},{"id":"2-2387-6327","name":"IE-CF-3B-B"},{"id":"2-2395-8088","name":"IE-CG-2B-A"},{"id":"2-2396-9083","name":"IE-CG-2B-B"},{"id":"2-2404-1124","name":"IE-CG-3B-A"},{"id":"2-2405-6331","name":"IE-CG-3B-B"},{"id":"2-2413-1106","name":"IE-CP-1B-A"},{"id":"2-2414-1107","name":"IE-CP-1B-B"},{"id":"2-2415-1109","name":"IE-CP-1B-C"},{"id":"2-2416-1110","name":"IE-CP-1B-D"},{"id":"2-2417-1111","name":"IE-CP-1B-E"},{"id":"2-2418-1113","name":"IE-CP-1B-F"},{"id":"2-2422-1095","name":"IE-DR-1B-A"},{"id":"2-2423-1096","name":"IE-DR-1B-B"},{"id":"2-2424-1097","name":"IE-DR-1B-C"},{"id":"2-2425-1099","name":"IE-DR-1B-D"},{"id":"2-2431-1100","name":"IE-DR-2B-A"},{"id":"2-2432-1101","name":"IE-DR-2B-B"},{"id":"2-2433-1103","name":"IE-DR-2B-C"},{"id":"2-2434-2301","name":"IE-DR-2B-D"},{"id":"2-2440-1104","name":"IE-DR-3B-A"},{"id":"2-2441-1105","name":"IE-DR-3B-B"},{"id":"2-2442-2302","name":"IE-DR-3B-C"},{"id":"2-2449-1018","name":"IE-IG-1B-A"},{"id":"2-2450-3602","name":"IE-IG-1B-B"},{"id":"2-2451-1019","name":"IE-IG-1B-C"},{"id":"2-2452-1020","name":"IE-IG-1B-D"},{"id":"2-2453-3599","name":"IE-IG-1B-E"},{"id":"2-2454-8444","name":"IE-IG-1B-F"},{"id":"2-2458-1006","name":"IE-IG-2B-A"},{"id":"2-2459-1034","name":"IE-IG-2B-B"},{"id":"2-2460-8434","name":"IE-IG-2B-C"},{"id":"2-2461-9455","name":"IE-IG-2B-D"},{"id":"2-2467-1078","name":"IE-IG-3B-A"},{"id":"2-2468-1953","name":"IE-IG-3B-B"},{"id":"2-2469-8491","name":"IE-IG-3B-C"},{"id":"2-3517-9152","name":"IE-INTAR-1B-A"},{"id":"2-3518-9153","name":"IE-INTAR-1B-B"},{"id":"2-3519-9154","name":"IE-INTAR-1B-C"},{"id":"2-3520-9155","name":"IE-INTAR-1B-D"},{"id":"2-3521-9156","name":"IE-INTAR-1B-E"},{"id":"2-3522-9157","name":"IE-INTAR-1B-F"},{"id":"2-3586-9457","name":"IE-INTAR-2B-D"},{"id":"2-2584-9181","name":"IE-IR-1B-A"},{"id":"2-2585-9182","name":"IE-IR-1B-B"},{"id":"2-2586-5530","name":"IE-IR-1B-C"},{"id":"2-2587-9183","name":"IE-IR-1B-D"},{"id":"2-2588-9184","name":"IE-IR-1B-E"},{"id":"2-2589-9185","name":"IE-IR-1B-F"},{"id":"2-2590-9186","name":"IE-IR-1B-G"},{"id":"2-2591-5535","name":"IE-IR-1B-H"},{"id":"2-3461-9187","name":"IE-IR-1B-I"},{"id":"2-2593-5692","name":"IE-IR-2B-A"},{"id":"2-2594-5693","name":"IE-IR-2B-B"},{"id":"2-2595-5694","name":"IE-IR-2B-C"},{"id":"2-2596-5930","name":"IE-IR-2B-D"},{"id":"2-2597-8032","name":"IE-IR-2B-E"},{"id":"2-2602-6132","name":"IE-IR-3B-A"},{"id":"2-2603-6133","name":"IE-IR-3B-B"},{"id":"2-2604-6134","name":"IE-IR-3B-C"},{"id":"2-2476-1079","name":"IE-MK-1B-A"},{"id":"2-2477-1080","name":"IE-MK-1B-B"},{"id":"2-2478-1011","name":"IE-MK-1B-C"},{"id":"2-2479-1082","name":"IE-MK-1B-D"},{"id":"2-2480-1083","name":"IE-MK-1B-E"},{"id":"2-2481-1085","name":"IE-MK-1B-F"},{"id":"2-2482-1086","name":"IE-MK-1B-G"},{"id":"2-2483-4478","name":"IE-MK-1B-H"},{"id":"2-3463-5624","name":"IE-MK-1B-I"},{"id":"2-3464-8952","name":"IE-MK-1B-J"},{"id":"2-2485-1087","name":"IE-MK-2B-A"},{"id":"2-2486-1088","name":"IE-MK-2B-B"},{"id":"2-2487-1089","name":"IE-MK-2B-C"},{"id":"2-2489-4692","name":"IE-MK-2B-E"},{"id":"2-2490-5392","name":"IE-MK-2B-F"},{"id":"2-2491-8063","name":"IE-MK-2B-G"},{"id":"2-2492-8064","name":"IE-MK-2B-H"},{"id":"2-2494-1091","name":"IE-MK-3B-A"},{"id":"2-2495-1092","name":"IE-MK-3B-B"},{"id":"2-2498-6116","name":"IE-MK-3B-E"},{"id":"2-2499-6117","name":"IE-MK-3B-F"},{"id":"2-2500-8079","name":"IE-MK-3B-G"},{"id":"2-2501-8376","name":"IE-MK-3B-H"},{"id":"2-2548-1013","name":"IE-NSEFS-3B-A"},{"id":"2-3493-9235","name":"IE-RB-1B"},{"id":"2-3514-9133","name":"IE-RB-1B-A"},{"id":"2-3515-9134","name":"IE-RB-1B-B"},{"id":"2-3516-9135","name":"IE-RB-1B-C"},{"id":"2-3589-9481","name":"IE-RB-2B-B"},{"id":"2-3529-9196","name":"IE-RT-1B-A"},{"id":"2-3530-9197","name":"IE-RT-1B-B"},{"id":"2-3531-9198","name":"IE-RT-1B-C"},{"id":"2-3532-9199","name":"IE-RT-1B-D"},{"id":"2-3533-9200","name":"IE-RT-1B-E"},{"id":"2-3534-9201","name":"IE-RT-1B-F"},{"id":"2-3535-9202","name":"IE-RT-1B-G"},{"id":"2-3536-9203","name":"IE-RT-1B-H"},{"id":"2-3537-9204","name":"IE-RT-1B-I"},{"id":"2-3541-9401","name":"IE-RT-2B-A"},{"id":"2-3478-8883","name":"IE-SBDA-4S"},{"id":"2-3479-8911","name":"IE-SBDA-4S-A"},{"id":"2-2557-992","name":"IE-TI-1B-A"},{"id":"2-2558-8962","name":"IE-TI-1B-B"},{"id":"2-2559-8964","name":"IE-TI-1B-C"},{"id":"2-2560-8965","name":"IE-TI-1B-D"},{"id":"2-2561-8966","name":"IE-TI-1B-E"},{"id":"2-2562-8967","name":"IE-TI-1B-F"},{"id":"2-2563-8968","name":"IE-TI-1B-G"},{"id":"2-2564-8969","name":"IE-TI-1B-H"},{"id":"2-3460-8970","name":"IE-TI-1B-I"},{"id":"2-2566-984","name":"IE-TI-2B-A"},{"id":"2-2567-985","name":"IE-TI-2B-B"},{"id":"2-2569-5004","name":"IE-TI-2B-D"},{"id":"2-2575-1076","name":"IE-TI-3B-A"},{"id":"2-2576-5661","name":"IE-TI-3B-B"}];

    const promotionTypes = [...new Set(promotions.map(promotion => promotion.name.split('-')[1]))];

    // Create sections for each promotion type
    promotionTypes.forEach(type => {
        const details = document.createElement('details');
        details.id = `section-${type}`;

        const summary = document.createElement('summary');
        summary.textContent = type;
        details.appendChild(summary);

        // Add checkboxes for each promotion within the section
        promotions.filter(promotion => promotion.name.includes(type)).forEach(promotion => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = promotion.id;
            checkbox.value = promotion.id;

            // Load the selected promotions
            const selectedPromotions = JSON.parse(localStorage.getItem('promotions')) || [];
            if (selectedPromotions.includes(promotion.id)) {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', SavePromotions);

            const label = document.createElement('label');
            label.htmlFor = promotion.id;

            const name = promotion.name.split('-').slice(2).join('-');

            label.appendChild(document.createTextNode(name));

            const div = document.createElement('div');
            div.className = 'promotion-item';
            div.appendChild(checkbox);
            div.appendChild(label);

            details.appendChild(div);
        });

        promotionList.appendChild(details);
    });

}
function SetupModal()
{
    let selectClassButton = document.getElementById('selectClassButton');
    let showClassesButton = document.getElementById('showClasses');
    let closeClassButton = document.getElementById('closeClasses');

    if(selectClassButton)
    {
        selectClassButton.addEventListener('click', OpenClasses);
    }

    if(showClassesButton)
    {
        showClassesButton.addEventListener('click', ShowClasses)
    }

    // when clicked outside the modal, close it
    let modal = document.getElementById('modal');
    modal.addEventListener('click', function(event)
    {
        if (event.target === modal)
        {
            modal.style.display = 'none';
        }
    });

    closeClassButton.addEventListener('click', function()
    {
        modal.style.display = 'none';
    });
}

async function LoadPromotions()
{

    let promotions = promotionList;

    // foreach promotionList add an event listener to the checkbox
    let checkboxes = document.querySelectorAll('#promotions-list input[type="checkbox"]');
    checkboxes.forEach(checkbox =>
    {
        checkbox.addEventListener('change', SavePromotions);
    });


    /*myPromotions = await sendRequest('classes/my');

    if(myPromotions.code === 401)
    {
        calendarMessage.style.display = 'block';
        calendarMessage.textContent = "Token invalide ou manquant";
    }
    else if(myPromotions.code === 402)
    {
        calendarMessage.textContent = "Veuillez accepter les conditions d'utilisation";
    } */

    // show a list of promotions in html
    /*myPromotions.data.forEach(promotion =>
    {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = promotion.promotion_id;
        checkbox.value = promotion.id;

        // load the selected promotions
        let selectedPromotions = JSON.parse(localStorage.getItem('promotions'));
        if (selectedPromotions)
        {
            if (selectedPromotions.includes(promotion.promotion_id))
            {
                checkbox.checked = true;
            }
        }

        checkbox.addEventListener('change', SavePromotions);

        let label = document.createElement('label');
        label.htmlFor = `promotion_${promotion.id}`;
        label.appendChild(document.createTextNode(promotion['promotion_label']));

        let div = document.createElement('div');
        div.className = 'promotion-item';
        div.appendChild(checkbox);
        div.appendChild(label);

        div.addEventListener('click', function() {
            checkbox.click();
        });

        checkbox.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        promotionList.appendChild(div);
    });*/
}

function LoadCachedEvents()
{
    let events = JSON.parse(localStorage.getItem('events'));
    if (events)
    {
        console.log("loading events from cache");
        calendarMessage.textContent = "Actualisation des événements...";
        calendarMessage.style.display = 'block';
        calendar = new Calendar(events);
    }
}

function SetupSettings()
{
    const openSettingsButton = document.getElementById('settings');
    const openSettingsButtonBurger = document.getElementById('settingsBurger');
    const popupContainer = document.getElementById('popup');

    openSettingsButtonBurger.addEventListener('click', () =>
    {
        popupContainer.style.display = 'flex';
        closeBurgerMenu();
    });

    openSettingsButton.addEventListener('click', () =>
    {
        popupContainer.style.display = 'flex';
    });


    popupContainer.addEventListener('click', (event) =>
    {
        if (event.target === popupContainer)
        {
            popupContainer.style.display = 'none';
        }
    });

    /*
    let token = localStorage.getItem('token');
    if (token)
    {
        document.getElementById('token').value = token;
    }
    else
    {
        console.warn('Token is empty');
    } */

    let clearSettingsButton = document.getElementById('clearSettings');

    clearSettingsButton.addEventListener('click', function()
    {
        localStorage.removeItem("classes");
        localStorage.removeItem("promotions");
        localStorage.removeItem("colors");
        localStorage.removeItem("events");
        localStorage.removeItem("token");
        localStorage.removeItem("conditionOfUse");

        location.reload();
    });
}


function SetupColors()
{
    let colorInputs = document.querySelectorAll('.colorInput');
    colorInputs.forEach(input =>
    {
        input.addEventListener('change', function()
        {
            let colors = localStorage.getItem('colors');

            if(colors)
            {
                colors = JSON.parse(colors);
            }
            else
            {
                colors = {};
            }

            colors[input.dataset.classId] = this.value;

            localStorage.setItem('colors', JSON.stringify(colors));

            calendar.UpdateColors();
        });
    });

    LoadColors();
}

function LoadColors()
{
    let colors = JSON.parse(localStorage.getItem('colors'));
    if(colors)
    {
        for (const [key, value] of Object.entries(colors)) {
            let input = document.querySelector(`.colorInput[data-class-id="${key}"]`);
            if (input)
            {
                input.value = value;
            }
        }
    }
}

function SetupConditionOfUse()
{
    let conditionOfUse = localStorage.getItem('conditionOfUse');

    let conditionOfUseObj;
    try {
        conditionOfUseObj = JSON.parse(conditionOfUse);
    } catch (e)
    {
        conditionOfUse = null;
    }

    if (conditionOfUse === null || (conditionOfUseObj && (conditionOfUseObj.v !== '1.1' || conditionOfUseObj.status !== 'accepted'))) {
        document.getElementById('conditions-container').style.display = 'flex';

        let conditionButton = document.getElementById('acceptConditions');

        conditionButton.addEventListener('click', function() {
            localStorage.setItem('conditionOfUse', '{"v" : "1.1", "status" : "accepted"}');
            location.reload();
        });
    }
}

function UpdateClasses()
{
    let classes = calendar.classes;

    if(classes)
    {

        // clear the classes
        class_b1.innerHTML = '';
        class_b2.innerHTML = '';
        class_b3.innerHTML = '';
        class_other.innerHTML = '';


        let i = 0;
        let selectedClasses = JSON.parse(localStorage.getItem('classes'));
        classes.forEach(classe =>
        {
            let input = document.createElement('input');
            input.type = "checkbox";
            // check in local storage if the class is selected

            if (selectedClasses && selectedClasses.length > 0)
            {
                let isNotSelected = selectedClasses.some(selectedClass => selectedClass.cours == classe.cours && Number(selectedClass.year) == Number(classe.year));
                input.checked = !isNotSelected;
            }
            else
            {
                input.checked = true;
            }

            input.addEventListener('change', saveClasses);

            let label = document.createElement('label');
            label.textContent = classe.cours;
            label.prepend(input);

            let div = document.createElement('div');
            div.className = 'promotion-item';
            div.appendChild(label);

            div.addEventListener('click', function() {
                input.click();
            });

            input.addEventListener('click', function(event) {
                event.stopPropagation();
            });

            if(classe.year == 0)
            {
                class_b1.appendChild(div);
            }
            else if(classe.year == 1)
            {
                class_b2.appendChild(div);
            }
            else if(classe.year == 2)
            {
                class_b3.appendChild(div);
            }
            else
            {
                class_other.appendChild(div);
            }
            i++;
        });
    }


}

function saveClasses()
{

    console.log('saving classes');

    localStorage.removeItem('classes');
    localStorage.setItem('classes', JSON.stringify([]));

    let classes = JSON.parse(localStorage.getItem('classes'));

    Array.from(class_b1.children).forEach(element =>
    {
        let label = element.children[0];
        let input = label.children[0];

        if (!input.checked)
        {
            classes.push({cours : label.textContent, year : '0'});
        }
    });

    Array.from(class_b2.children).forEach(element =>
    {
        let label = element.children[0];
        let input = label.children[0];
        if (!input.checked)
        {
            classes.push({cours : label.textContent, year : '1'});
        }
    });

    Array.from(class_b3.children).forEach(element =>
    {
        let label = element.children[0];
        let input = label.children[0];
        if (!input.checked)
        {
            classes.push({cours : label.textContent, year : '2'});
        }
    });

    Array.from(class_other.children).forEach(element =>
    {
        let label = element.children[0];
        let input = label.children[0];

        if (!input.checked)
        {
            classes.push({cours : label.textContent, year : '3'});
        }
    });

    localStorage.setItem('classes', JSON.stringify(classes));

    Updatecalendar(); // update direcly the calendar to avoid any delay and show the result smoothly
}

async function SavePromotions()
{
    localStorage.removeItem('promotions');
    let promotions = [];

    let classes = promotionList.querySelectorAll('.promotion-item');

    classes.forEach(classe =>
    {
        let checkbox = classe.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked)
        {
            promotions.push(checkbox.id);
        }
    });

    localStorage.setItem('promotions', JSON.stringify(promotions));

    await getMyEvents(); // update in background the events
    //UpdateClasses();
}

function UpdateToken()
{
    let token = document.getElementById('token').value;

    if (token)
    {
        localStorage.setItem('token', token);

        window.location.reload();
    }
    else
    {
        console.error('Token is empty');
    }
}

async function GetClasses(events)
{
    events.forEach(event =>
    {
        let title = event['title'];
        let level = GetLevelOfEvent(title);

        if (level)
        {
            classes[level].push(event);
        }
    });

}


async function getMyEvents()
{
    let items = getSelectedPromotions();

    let events =  await sendRequest('planning', items);


    if(events.status === 520)
    {
        setCalendarMessage("Erreur lors de la récupération des événements", true);
        return;
    }

    const eventsArray = events.flatMap(str => {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error("Erreur de parsing JSON:", e);
            return [];
        }
    });



    let oldDate;
    if(calendar && calendar.calendar)
    {
        oldDate = calendar.calendar.getDate();
    }

    eventsArray.forEach(event =>
    {
        event.title += ' - ' + event.location;
    });

    calendar = new Calendar(eventsArray, oldDate);
}

async function Updatecalendar()
{
    let oldDate;
    if(calendar)
    {
        oldDate = calendar.calendar.getDate();
        calendar = new Calendar(calendar.events, oldDate);
    }
}

function getSelectedPromotions()
{
    let promotions;

    try
    {
        promotions= JSON.parse(localStorage.getItem('promotions'));
    }
    catch (e)
    {
        console.error('Invalid JSON format');
        return;
    }

    return promotions;
}


function ImportSettings()
{
    let ImportedSettings = document.getElementById('ImportSettings').value;

    if(ImportedSettings)
    {
        let settings;
        try
        {
            settings = JSON.parse(ImportedSettings);
        } catch (e)
        {
            console.error('Invalid JSON format');
            return;
        }
        localStorage.setItem('token', settings.token);


        let colors =
            {
                "0" : settings.colors[0],
                "1" : settings.colors[1],
                "2" : settings.colors[2],
                "3" : settings.colors[3],
            }
        localStorage.setItem('colors', JSON.stringify(colors));
        localStorage.setItem('promotions', settings.promotions);


        let classes = [];

        if(settings.from === 'EnhancedHenalluxPortail')
        {
            classes = settings.classes;

            localStorage.setItem('classes', classes);
        }
        else
        {
            let oldClasses = settings.classes;
            oldClasses = JSON.parse(oldClasses);

            oldClasses.forEach(oldClass =>
            {
                classes.push({cours : oldClass.classe, year : Number(oldClass.year) === 0 ? 3 : oldClass.year - 1});
            });

            localStorage.setItem('classes', JSON.stringify(classes));
        }

        location.reload();
    }
}

function ExportSettings()
{
    let settings =
    {
        from : 'EnhancedHenalluxPortail',
        token : localStorage.getItem('token'),
        colors : JSON.parse(localStorage.getItem('colors')),
        promotions : localStorage.getItem('promotions'),
        classes : localStorage.getItem('classes')
    }

    navigator.clipboard.writeText(JSON.stringify(settings));
}

async function OpenClasses()
{
    // if modalClasses is empty do it
    let modalClasses = document.getElementById('modalClasses');
    let modal = document.getElementById('modal');

    if(modalClasses.children.length === 0)
    {
        let classes = await sendRequest('local/');

        // Add for each class a button and a label
        classes.data.forEach(classe =>
        {
            // create a checkbox
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = classe.id;
            checkbox.className = 'classCheckbox';


            let label = document.createElement('label');
            label.textContent = classe.local_name;
            label.className = 'classLabel';

            let div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);

            div.addEventListener('click', function()
            {
                checkbox.click();
            });

            modalClasses.appendChild(div);
        });
    }

    if(modal)
    {
        modal.style.display = 'grid';
    }

}

async function ShowClasses()
{
    let modal = document.getElementById('modalClasses');

    //  make an array with all id from all selected checkboxes
    let classes = "[";

    Array.from(modal.children).forEach(element =>
    {
        let checkbox = element.children[0];
        if (checkbox.checked)
        {
            classes += checkbox.id + ',';
        }
    });

    classes = classes.slice(0, -1);
    classes += ']';

    let modalContainer = document.getElementById('modal');
    modalContainer.style.display = 'none';

    let test = await sendRequest("plannings/local/" + classes);

    calendar.ShowCalendarWithoutSettings(test);
}

// Update classes when using the search bar in the modal
function UpdateClassesModal()
{
    let search = document.getElementById('searchBar').value;
    let classes = document.getElementsByClassName('classLabel');

    Array.from(classes).forEach(element =>
    {
        if(element.textContent.toLowerCase().includes(search.toLowerCase()))
        {
            element.parentElement.style.display = 'block';
        }
        else
        {
            element.parentElement.style.display = 'none';
        }
    });
}

async function ImportPromotions()
{
    let promotions = document.getElementById('ImportPromotions').value;

    // promotions needs to be this format in json
    // [{"classe" : value, "id" : value, "name" : value, "type" : value}, ...]
    console.log(promotions);
    try
    {
        promotions = JSON.parse(promotions);
    }
    catch (e)
    {
        console.error('Invalid JSON format');
        return;
    }

    // check the format of the input // [{"classe" : value, "id" : value, "name" : value, "type" : value}, ...]
    let regex = /^\[{"classe" : ".+", "id" : ".+", "name" : ".+", "type" : ".+"}, .+\]$/;
    /*if(!regex.test(promotions))
    {
        console.error('Invalid JSON format');
        return;
    }*/


    // send data to the server
    await sendRequest('import/promotions', {promotions : promotions});



}