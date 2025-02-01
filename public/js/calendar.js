// a calendar class with by default value, get a ref to the balise and set the value

class Calendar
{
    constructor(events, oldDate, enableColors = true)
    {
        if(events)
        {
            this.calendarElement = document.querySelector('calendar');
            this.classes = new Array(4); // B1, B2, B3 and other
            this.events = events;
            this.colors = new Array(4);

            this.CacheEvents(events);
            this.FillClasses(events);

            let filteredEvents = this.FilterEvents(events);

            this.LoadClassesColors();

            this.calendar = new FullCalendar.Calendar(this.calendarElement,
                {
                    initialView: 'listWeek',
                    locale: 'fr',
                    firstDay: 1, // start at Monday
                    events: filteredEvents,
                    initialDate: oldDate, // if calendar is reloaded, keep the date where it was
                    timeZone: 'Europe/Brussels',
                    noEventsContent: 'Aucun événement à afficher',
                    eventDidMount: (info) =>
                    {
                        info.el.style.backgroundColor =  enableColors ? this.GetBackgroundColor(info.event) : '#FFC7C7';
                    }
                });

            this.calendar.render();
        }

    }

    UpdateColors()
    {
        this.LoadClassesColors();
        this.calendar.getEvents().forEach(event =>
        {
            event.setProp('backgroundColor', this.GetBackgroundColor(event));
        });

        // change view to refresh colors
        // this is a hack to refresh the colors of the events. but at least it works
        this.calendar.changeView('dayGridMonth');
        this.calendar.changeView('listWeek');
    }

    Empty()
    {
        this.calendar.innerHTML = '';
    }

    FillClasses(events)
    {
        this.classes = new Array(4);
        this.classes[0] = [];
        this.classes[1] = [];
        this.classes[2] = [];
        this.classes[3] = [];

        let classes = []; // format {cours : , year : }

        events.forEach(event =>
        {
            let title;
            if(event.title.startsWith('UE '))
            {
                title = event.title.split('-')[1];
                // remove first space
                title = title.substring(1);
            }
            else
            {
                title = event.title.split('-')[0];
            }

            let length = 0;
            if (event.title.includes('[') && !event.title.endsWith('['))
            {
                length = event.title.split('[')[1].length;
            }

            if(length > 1)
            {
                let i = 0;
                while(i < event.title.length)
                {
                    if(event.title[i] === '[')
                    {
                        // check if there is a space after the [, cause they fucked up the format

                        if(event.title[i+1] === ' ')
                        {
                            // check if the cours with the same title and year is already in the array
                            if(!classes.some(e => e.cours === title && e.year === event.title[i+2] - 1))
                            {
                                classes.push({cours : title, year : event.title[i+2] - 1});
                            }
                            i++;
                        }
                        else
                        {
                            if(!this.classes[event.title[i+1] - 1].includes(title))
                            {
                                // check if the cours with the same title and year is already in the array
                                if(!classes.some(e => e.cours === title && e.year === event.title[i+1] - 1))
                                {
                                    classes.push({cours : title, year : event.title[i+1] - 1});
                                }
                            }
                        }
                    }
                    i++;
                }
            }
        });

        classes.forEach(element =>
        {
            let count = 0;
            for(let i = 0; i < 3; i++)
            {
                if(classes.some(e => e.cours === element.cours && e.year === i))
                {
                    count++;
                }
            }

            if(count === 3)
            {
                for(let i = 0; i < 3; i++)
                {
                    const index = classes.findIndex(e => e.cours === element.cours && e.year === i);
                    if(index > -1)
                    {
                        classes.splice(index, 1);
                    }
                }

                classes.push({cours : element.cours, year : 3});
            }

        })

        this.classes = classes;
    }

    GetBackgroundColor(event)
    {
        // if event is in B1, B2, B3 or other
        let title = event.title;
        let level = this.GetYear(title);

        return this.colors[level];
    }

    LoadClassesColors()
    {
        // load from local storage
        let colors = localStorage.getItem('colors');

        if(colors)
        {
            let colorsArray = JSON.parse(colors);
            this.colors = new Array(4);
            this.colors[0] = colorsArray["0"] ? colorsArray["0"] : '#FFC7C7';
            this.colors[1] = colorsArray["1"] ? colorsArray["1"] : '#C7E7FF';
            this.colors[2] = colorsArray["2"] ? colorsArray["2"] : '#C7FFC8';
            this.colors[3] = colorsArray["3"] ? colorsArray["3"] : '#FBFFDB';
        }
        else
        {
            this.colors = ['#FFC7C7', '#C7E7FF', '#C7FFC8', '#FBFFDB'];
        }
    }

    /*
    * Return the year (0 to 3) of the event
    * */
    GetYear(title)
    {
        /*let year = title.split('[')[1];
        if(year)
        {
            return Number(year[0]) - 1;
        }*/

        let yearsTitle = [];
        let regex = /\[(.*?)\]/g;
        let match;

        while ((match = regex.exec(title)) !== null) {
            yearsTitle.push(match[1]);
        }


        let year = -1;
        //console.log(yearsTitle);
        let bOther = false
        yearsTitle.forEach(element =>
        {
            if(element.length > 0 && !bOther)
            {

                // check if first is space
                let currentYear;
                if(element[0] === ' ')
                {
                    currentYear = Number(element[1]) - 1;
                }
                else
                {
                    currentYear = Number(element[0]) - 1;
                }


                if(year === -1 || year === currentYear)
                {
                    year = currentYear;
                }
                else
                {
                    bOther = true;
                }
            }
        });

        if(bOther)
        {
            year = 3;
        }

        return year;
    }

    /*
     * Filter events based on user's preferences
     */
    FilterEvents(events)
    {
        let viewedEvents = events;

        let excludedClasses = localStorage.getItem('classes');
        excludedClasses = JSON.parse(excludedClasses);

        viewedEvents.forEach(event =>
        {
            let title;
            if(event.title.startsWith('UE '))
            {
                title = event.title.split('-')[1];
                // remove first space
                title = title.substring(1);
            }
            else
            {
                title = event.title.split('-')[0];
            }

            let length = 0;
            if (event.title.includes('[') && !event.title.endsWith('['))
            {
                length = event.title.split('[')[1].length;
            }

            if(length > 1)
            {
                let year = this.GetYear(event.title);

                if(excludedClasses && excludedClasses.length > 0)
                {

                    if(excludedClasses.some(e => e.cours === title && Number(e.year) === Number(year)))
                    {
                        viewedEvents = viewedEvents.filter(e => e.title !== event.title);
                    }
                }
            }
        });

        return viewedEvents;
    }

    /*
    * Cache events from this week's monday to next week's sunday
     */
    CacheEvents(events)
    {
        let now = new Date();

        let startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 1, 0, 0);

        let endOfNextWeek = new Date(startOfWeek);
        endOfNextWeek.setDate(startOfWeek.getDate() + 14);
        endOfNextWeek.setHours(0, 1, 0, 0);

        let cacheEvents = events.filter(event =>
        {
            // some events don't have a start or end date (?? this is dump)
            if (!event.start || !event.end)
            {
                return false;
            }

            // convert date to ISO 8601 format
            let start = new Date(event.start.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z'));
            let end = new Date(event.end.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z'));

            return start >= startOfWeek && end <= endOfNextWeek;
        });

        localStorage.setItem('events', JSON.stringify(cacheEvents));
    }

    LoadCachedEvents()
    {

    }

}

