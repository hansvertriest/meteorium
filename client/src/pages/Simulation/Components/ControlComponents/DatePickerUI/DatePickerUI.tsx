// Node imports
import React, { FunctionComponent, useEffect, useState, Fragment } from "react";

// Component imports
import {
    Option,
    OptionLoading
} from './components';
import {
    SearchInput,
} from '../../../../../components';
import { useApi } from '../../../../../services';

// Class imports
import TimeControls from "../../../Engine/Controls/TimeControls";

// SCSS imports
import './DatePickerUI.scss';

// Asset imports
import icon from '../../../assets/icons/date-icon.svg';
import editIcon from '../../../../../assets/icons/edit-icon.svg';

// Type imports
import {
    IShowerInfo,
} from '../../../Engine/d.types';

import {
    ITopDate,
    IYearCount,
    IYearlyCount,
    IMonthCount
} from '../../../../../services/d.types';

interface DatePickerUIProps {
    time: TimeControls,
    isVisible: boolean,
    toggleVisibility: () => void,
    onDateWithShowerSelect: ( iauCode: string ) => void,
}
interface IDateByShower {
    count: string,
    date: string,
}

const DatePickerUI: FunctionComponent<DatePickerUIProps> = ( { time, isVisible, toggleVisibility, onDateWithShowerSelect }: DatePickerUIProps ) => {

    const { getTopDates, getYearlyCount, getShowerSearchResults } = useApi();

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Augustus', 'September', 'October', 'November', 'December'];

    const [ pickingMode, setPickingMode ] = useState<string>('date');
    const [ yearlyCount, setYearlyCount ] = useState<IYearlyCount | undefined>(undefined);

    // Search by date states
    const [ selectedYear, setSelectedYear ] = useState<string | undefined>(undefined);
    const [ selectedMonth, setSelectedMonth ] = useState<number | undefined>(undefined);
    const [ selectedDay, setSelectedDay ] = useState<string | undefined>(undefined);
    const [ dates, setDates ] = useState<{dates: ITopDate[], max_count: number} | undefined>(undefined);
    const [ topDates, setTopDates ] = useState<{dates: ITopDate[], max_count: number} | undefined>(undefined);
    
    // Search by shower states
    const [ selectedIauCode, setSelectedIauCode ] = useState<string | undefined>();
    const [ bestDatesForShower, setBestDatesForShower ] = useState<{dates: IDateByShower[], max_count: number} | undefined>();
    const [ showerSearchTerm, setShowerSearchTerm ] = useState<string | undefined>();

    // General states
    const [ isLoading, setIsLoading ] = useState<boolean>(false);


    // Fetch YEARS + MONTHS
    useEffect(() => {
        const fetchYearlyCount = async () => {
            const fetchedYearlyCount = await getYearlyCount();
            setYearlyCount(fetchedYearlyCount);
            scrollToTop();
            setIsLoading(false);
        }

        fetchYearlyCount();
        setIsLoading(true);
    }, []);

    // Fetch TOP-DAYS (over 1 year)
    useEffect(() => {
        const getTopDatesOfYear = async () => {
            const fetchDates = await getTopDates({limit: '3', year: selectedYear});
            setTopDates(fetchDates);
            scrollToTop();
            setIsLoading(false);
        }
        if ( selectedYear ) {
            getTopDatesOfYear();
            setTopDates(undefined);
            setIsLoading(true);
        }
    }, [selectedYear]);

    // Fetch DAYS +  TOP-DAYS (over 1 month)
    useEffect(() => {
        const getDatesOfMonth = async () => {
            // const monthNumber = new Date(Date.parse(selectedMonth +" 1, 2012")).getMonth()+1;
            const fetchDates = await getTopDates({limit: '3', year: selectedYear, month: selectedMonth});
            setTopDates(fetchDates);
            const dailyDates = await getTopDates({limit: '31', year: selectedYear, month: selectedMonth});
            setDates(dailyDates);
            scrollToTop();
            setIsLoading(false);
        }
        if (selectedMonth) {
            getDatesOfMonth();
            setTopDates(undefined);
            setIsLoading(true);
        }
    }, [selectedMonth]);

    // Fetch SHOWER-DATES
    useEffect(() => {   
        const getDatesByShower = async ( ) => {
            setIsLoading(true);
            const fetchShowerDates = await getTopDates({limit: '10', shower: selectedIauCode});
            setBestDatesForShower(fetchShowerDates);
        }

        if (selectedIauCode) getDatesByShower();
    }, [selectedIauCode]);

    useEffect(() => {
        scrollToTop();
    }, [topDates]);

    const selectDate = ( date: Date ):void => {
        time.selectDate(date);
        toggleVisibility();
    }

    const searchShower = async ( searchTerm: string ): Promise<{name: string, iauCode: string}[]> => {
        const fetchSearchResults: IShowerInfo[] = await getShowerSearchResults(searchTerm);
        return fetchSearchResults.map((result) => {
            return {name: result.name, iauCode: result.iauCode}
        });
    }

    // Render functions

    const renderYearOverview = () => {
        if (yearlyCount) {
            const years = yearlyCount.years;
            const yearEls =  years.map((year: IYearCount) => {
                const width = Number(year.total_observations)/Number(yearlyCount.max_yearly_count)*100;
    
                return (
                    <Option 
                        key={year.name}
                        type='year'
                        label={year.name}
                        count={year.total_observations}
                        width={width}
                        onClick={() => {
                            setSelectedYear(year.name);
                        }}
                    />
                );
            })
            return yearEls;
        }
    }

    const renderMonthOverview = () => {
        if (yearlyCount && selectedYear) {
            const year: IYearCount = yearlyCount.years.filter((year) => year.name === selectedYear)[0];
            const yearEls =  year.months.map((month: IMonthCount) => {
                const width = Number(month.count)/Number(year.max_monthly_count)*100;
    
                return (
                    <Option 
                        key={'month-'+month.name}
                        type='month'
                        label={month.name.substring(0, 3)}
                        count={month.count}
                        width={width}
                        onClick={() => {
                            setSelectedMonth(new Date(Date.parse(month.name +" 1, 2012")).getMonth()+1);
                        }}
                    />
                );
            })
            return yearEls;
        }
    }

    const renderDayOverview = () => {
        if (dates && dates.dates) {
            // Sort date chronologicaly
            const topPickEls =  dates.dates.sort((date1, date2) => {
                const date1Obj = new Date(date1.date);
                const date2Obj = new Date(date2.date);
                if (date1Obj.getDate() < date2Obj.getDate()) {
                    return -1
                }
                return 1;
            })
            
            // Return jsx elements
            // return <OptionLoading />
            return topPickEls.map((date: ITopDate) => {
                const width = Number(date.count)/Number(dates.max_count)*100;
                const dateObj = new Date(date.date);
                const mm = dateObj.getMonth() + 1;
                const dd = dateObj.getDate();
                const dateName =  dd + '-' + mm
    
                return (
                    <Option 
                        key={'top-day-'+dateName}
                        type='month'
                        label={dd.toString()}
                        count={date.count}
                        width={width}
                        onClick={() => {
                            selectDate(dateObj); 
                            setSelectedDay(dd.toString())
                        }}
                    />
                );
            })
        } else {
            const newEl = (key:number) => { return (<OptionLoading key={key.toString()} />)};
            return [ newEl(0),newEl(1),newEl(2),newEl(3),newEl(4),newEl(5),newEl(6),newEl(7) ]
        }
    }

    const renderTopPickOverview = () => {
        if (topDates && topDates.dates) {
            const topPickEls =  topDates.dates.map((date: ITopDate) => {
                const dateObj = new Date(date.date);
                const mm = dateObj.getMonth() + 1;
                const dd = dateObj.getDate();
                const dateName =  dd + '-' + mm
    
                return (
                    <div 
                        className="top-date-option" key={'top-date-'+dateName}
                        onClick={() => {
                            selectDate(dateObj); 
                            setSelectedMonth(mm)
                            setSelectedDay(dd.toString())
                        }}
                    >
                        <p className="option-label">{daysOfWeek[dateObj.getDay()]}, {dd} {monthsOfYear[Number(mm-1)].toLowerCase()}</p>
                        <p className="option-description">{date.count}<span>meteors</span></p>
                    </div>
                );
            })
            return topPickEls;
        } else {
            const newEl = (key:number) => { return (
                <div className="top-date-option--loading" key={key}>
                    <p className="option-label"></p>
                    <p className="option-description"></p>
                </div>
            )};
            return [ newEl(0), newEl(1), newEl(2)];
        }
    }

    const renderShowerOverview = () => {
        if (bestDatesForShower && bestDatesForShower.dates) {
            // new object split up by year
            const datesByYear: {[year: string] : IDateByShower[]} = {};
            bestDatesForShower.dates.forEach((dateObj) => {
                const year: string = dateObj.date.toString().split(' ')[3];
                if (!Object.keys(datesByYear).includes(year)) {
                    datesByYear[year] = [dateObj]
                } else {
                    datesByYear[year].push(dateObj)
                }
            });


            return (
                Object.keys(datesByYear).map((year) => {
                    return(
                        <div className="datepicker-shower__overview-year-container" key={'year-'+year}>
                            <p className="overview-year__label">{year}</p>
                            {
                                datesByYear[year].map((dateObj) => {
                                    const date = new Date(dateObj.date);
                                    const mm = date.getMonth() + 1;
                                    const dd = date.getDate();
                                    const dateName =  year + '-' + dd + '-' + mm
                                    // calculate width
                                    const width = Number(dateObj.count)/Number(bestDatesForShower.max_count)*100;
                                    return (
                                        <Option 
                                            key={'day-'+dateName}
                                            type='day'
                                            label={dateObj.date.split(' ')[1] + ' ' + dateObj.date.split(' ')[2]}
                                            count={dateObj.count}
                                            width={width}
                                            onClick={() => {
                                                selectDate(date); 
                                                setSelectedMonth(mm);
                                                setSelectedDay(dd.toString());
                                                if (selectedIauCode) onDateWithShowerSelect(selectedIauCode);
                                            }}
                                        />
                                    );
                                })
                            }
                        </div>
                    );
                })
            )
        } else if(isLoading) {
            const newEl = (key:number) => { return (<OptionLoading key={key.toString()} />)};
            return [ newEl(0),newEl(1),newEl(2),newEl(3),newEl(4),newEl(5),newEl(6),newEl(7) ]
        }
        
    }

    const scrollToTop = (): void => {
        const datepickerContainer = document.getElementById('datepicker');
        if (datepickerContainer) datepickerContainer.scrollTop = 0;
    }

    return (
        <div 
            className={`datepicker noselect ${(!isVisible) ? 'datepicker--hidden' : null}`} 
            onClick={() => {
                if (!isVisible) {
                    toggleVisibility();
                }
            }}
        >
            <p className="tab-label">Pick a date</p>
            <div className="selected-date-container">
                {
                    (isVisible)
                    ?
                    <Fragment>
                        <p className="selected-date">
                            <span 
                                className={(selectedYear) ? ` selected-date-component-year selected-date-component--defined` : 'selected-date-component-year'}
                                onClick={() => {setSelectedYear(undefined); setSelectedMonth(undefined); setSelectedDay(undefined); setDates(undefined)}}
                            >
                                {(selectedYear) ? selectedYear : 'YYYY'}
                            </span> - 
                            <span 
                                className={(selectedMonth) ? `selected-date-component-month selected-date-component--defined` : 'selected-date-component-month'}
                                onClick={() => {setSelectedDay(undefined); setDates(undefined); setSelectedMonth(undefined)}}
                            >
                                {(selectedMonth) ? ("0" + selectedMonth).slice(-2) : 'MM'}
                            </span> - 
                            <span 
                                className={(selectedDay) ? `selected-date-component-day selected-date-component--defined` : 'selected-date-component-day'}
                                onClick={() => {setSelectedDay(undefined); setDates(undefined)}}
                            >
                                {(selectedDay) ? ("0" + selectedDay).slice(-2) : 'DD'}
                            </span>
                            {
                                (selectedYear || selectedMonth || selectedDay)
                                ? <img 
                                    src={editIcon}
                                    onClick={() => {setSelectedYear(undefined); setSelectedMonth(undefined); setSelectedDay(undefined); setDates(undefined)}}
                                />
                                :null
                            }
                        </p>
                    </Fragment>
                    :null
                }
                <img 
                    className="tab-icon" 
                    src={icon}
                    onClick={() => {toggleVisibility()}}
                />
            </div>

            <div className="datepicker-container" >
                
                <div className="pickingmode-container">
                    <p className="pickingmode-label">search by:</p>
                    <p 
                        className={`pickingmode-option pickingmode-option--${(pickingMode === 'date') ? 'active' : null}`}
                        onClick={() => setPickingMode('date')}
                    >
                        Dates</p>
                    <p 
                        className={`pickingmode-option pickingmode-option--${(pickingMode === 'shower') ? 'active' : null}`}
                        onClick={() => setPickingMode('shower')}
                    >
                        Meteor showers</p>
                </div>

                {
                    (isVisible) ?
                    
                        (pickingMode === 'date') 
                        ? 

                        // SEARCH BY DATE

                        <div className="datepicker-date" id="datepicker">
                            {/* Year-overview */}
                            {
                                (yearlyCount && !selectedYear)
                                ? <Fragment>
                                    <div className="datepicker-date__year-overview">
                                        <p className="sub-title">Years</p>
                                        {renderYearOverview()}
                                    </div>
                                </Fragment>
                                : null
                            }

                            {/* Month-overview */}
                            {
                                (yearlyCount && selectedYear && !selectedMonth)
                                ? 
                                <Fragment>
                                    <div className="datepicker-date__top-dates">
                                        <p  className="sub-title">Top days in {selectedYear}</p>
                                        {/* {(topDates) ? renderTopPickOverview() : <LoadingAnimation width={20} />} */}
                                        {renderTopPickOverview()}
                                    </div> 
                                    <div className="datepicker-date__month-overview">
                                        <p  className="sub-title">Months in {selectedYear}</p>
                                        {renderMonthOverview()}
                                    </div>
                                </Fragment>
                                : null
                            }

                            {/* Day-overview */}
                            {
                                (yearlyCount && selectedYear && selectedMonth)
                                    ? 
                                    <Fragment>
                                        <div className="datepicker-date__top-dates"> 
                                            <p  className="sub-title">Top days in {selectedYear}, {monthsOfYear[selectedMonth-1]}</p>
                                            {renderTopPickOverview()}
                                        </div> 
                                        <div className="datepicker-date__month-overview">
                                            <p  className="sub-title">Days in {selectedYear}, {monthsOfYear[selectedMonth-1]}</p>
                                            {renderDayOverview()}
                                        </div>
                                    </Fragment>
                                    : null
                            }
                        </div>
                        : 

                        (pickingMode === 'shower')
                        ? 

                        // SEARCH BY SHOWER

                        <div className="datepicker-shower">
                            <div className="datepicker-shower__select"> 
                                <SearchInput 
                                    defaultValue={showerSearchTerm}
                                    placeholder="Search a meteor shower"
                                    id="shower-search"
                                    fetchResults={async (value)=> {
                                        setIsLoading(true);
                                        const showers = await searchShower(value);
                                        setIsLoading(false);
                                        return showers.map((result) => {return{ value:result.name, id: result.iauCode  }});
                                    }}
                                    onSelect={(iauCode, showerName) => {
                                        setBestDatesForShower(undefined);
                                        setSelectedIauCode(iauCode);
                                        setShowerSearchTerm(showerName)
                                    }}
                                />
                            </div>
                            <div className="datepicker-shower__overview">
                                {renderShowerOverview() }
                                {
                                    (!bestDatesForShower)
                                        ? <p className="datepicker-shower__info">Search for a meteor shower to see at which dates it was best obeserved.</p>
                                        : (bestDatesForShower.dates.length === 0)
                                            ? <p className="datepicker-shower__info">There are no recordings for this meteor shower.</p>
                                            : null
                                }
                            </div>
                        </div>

                        : null
                    : null
                }
            
            </div>
            
        </div>
    );
}

export default DatePickerUI;