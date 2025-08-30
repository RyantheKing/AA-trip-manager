interface Crew {
    position: string;
    name: string;
    empNbr: string;
    comments: string;
    info: string[];
}

class Trip {
    SEQ: string;
    ABSEQ: string = "";
    base: string = "";
    sel: string = "";
    fleet: string = "";
    div: string = "";
    crew: Crew[] = []; // crew. list of objects for each CAPT, F/O, etc
    dutyPeriods: DutyPeriod[] = []; // list of duty period objects
    additionalInfo: string[] = []; // a list of any strings in between header line and crew section
    original: boolean = false;
    hash: string = "";
    ETB: boolean = false;
    TTS: boolean = false;
    REDFLAG: boolean = false;
    IPD: boolean = false;
    flightTime: string = "";
    flightTimeType: string = "";
    pcTime: string = "";
    tlTime: string = "";
    ptlTime: string = "";
    tafbTime: string = "";
    _id: string = "";

    constructor(SEQ: string) {
        this.SEQ = SEQ; // sequence number
    }

    addCrew(name: string, empNbr: string, pos: string, comments: string, additionalInfo: string[]) {
        const crew = {
            position: pos, // F/O, F/B, CAPT, FA1, etc.
            name: name,
            empNbr: empNbr,
            comments: comments, // any comments on the same line as the crew (ex: RESTRICTED)
            info: additionalInfo, // any indented information on the line after the crew line
        };
        this.crew.push(crew);
    }

    genHash() {
        // make sure hash hasn't already been generated
    }
}

class TripGroup {
    seqDate: string;
    tripVersions: { [key: string]: Trip } = {};
    constructor(seqDate: string, trip: Trip) {
        this.seqDate = seqDate;
    }

    addTrip(trip: Trip) {
        if (!trip.hash) {
            trip.genHash();
            if (trip.hash in this.tripVersions) {
                // duplicate, do nothing.
            } else {
                this.tripVersions[trip.hash] = trip;
            }
        }
    }
}

interface OnDutyLine {
    type: string;
    onDutyTime: string;
    odlTime: string;
    expTime: string;
    expType: string;
    siData: string;
    rlsData: string;
    rangeType: string;
}

class DutyPeriod {
    dp: string;
    dpTime: string;
    pcTime: string;
    tlTime: string;
    flights: Flight[][];
    halfDay: boolean = false;
    hdPorts: string[] = [];
    hdCounts: string[] = [];
    onDutyInfo: OnDutyLine[] = [];
    FDPT: string = "";
    startTime: string = "";
    endTime: string = "";
    accsta: string = "";
    rsvBegan: string = "";
    rsvEnds: string = "";

    constructor(dp: string, dpTime: string, pcTime: string, tlTime: string, flightArr: Flight[][]) {
        this.dp = dp; // GTR, SKD, etc
        this.dpTime = dpTime;
        this.pcTime = pcTime;
        this.tlTime = tlTime;
        this.flights = flightArr; // array of legs (each leg is an array of single flight plans)
    }

    pushHalfDay(port: string, time: string) {
        this.halfDay = true;
        this.hdPorts.push(port);
        this.hdCounts.push(time);
    }
}

class Flight {
    rsn: any;
    DT: string;
    EQ: string;
    FLT: string;
    DSTA: string;
    DEP: string;
    M: string;
    ASTA: string;
    ARR: string;
    AC: string;
    FLY: string;
    GTR: string;
    GRD: string;
    ACT: string;
    ACTtime: string;
    depRev: boolean;
    arrRev: boolean;

    constructor(rsn: string) {
        this.rsn = rsn; // SKD, ACT, etc. There can be two "flight" objects for one flight leg, the scheduled AND actual

        this.DT = "";
        this.EQ = "";
        this.FLT = "";
        this.DSTA = "";
        this.DEP = "";
        this.M = "";
        this.ASTA = "";
        this.ARR = "";
        this.AC = "";
        this.FLY = "";
        this.GTR = "";
        this.GRD = "";
        this.ACT = "";
        this.ACTtime = "";
        this.depRev = false;
        this.arrRev = false;
    }

    validateFlight() {
        // check format for columns DT/EQ/FLT/STA/DEP/M/ARR/AC/FLY/GTR/GRD/ACT
        if (this.DT !== "" && !/^(\d{2})$/.test(this.DT)) {
            console.error("Invalid DT", this.DT);
        }
        if (!/^(\d{2}|XX)$/.test(this.EQ)) {
            console.error("Invalid EQ", this.EQ);
        }
        if (this.FLT !== "" && !/^(\d{1,4})$/.test(this.FLT)) {
            console.error("Invalid FLT", this.FLT);
        }
        if (!/^([A-Z]{3})$/.test(this.DSTA)) {
            console.error("Invalid DSTA", this.DSTA);
        }
        if (this.DEP !== "" && !/^(\d{4})$/.test(this.DEP)) {
            console.error("Invalid DEP", this.DEP);
        }
        if (this.M !== "" && !/^([A-Z])$/.test(this.M)) {
            console.error("Invalid M", this.M);
        }
        if (!/^([A-Z]{3})$/.test(this.ASTA)) {
            console.error("Invalid ASTA", this.ASTA);
        }
        if (this.ARR !== "" && !/^(\d{4}|\*\*\*\*)$/.test(this.ARR)) {
            console.error("Invalid ARR", this.ARR);
        }
        if (this.AC !== "" && !/^([0-9A-Z]{2}|\*)$/.test(this.AC)) {
            console.error("Invalid AC", this.AC);
        }
        if (this.FLY !== "" && !/^(\d{1,2}\.\d{2}([A-Z]{2})?|0\.00RPRT)$/.test(this.FLY)) {
            console.error("Invalid FLY", this.FLY);
        }
        if (this.GTR !== "" && !/^(\d{1,2}\.\d{2}|[A-Z]{4})$/.test(this.GTR)) {
            console.error("Invalid GTR", this.GTR);
        }
        if (this.GRD !== "" && !/^(\d{1,2}\.\d{2})$/.test(this.GRD)) {
            console.error("Invalid GRD", this.GRD);
        }
        if (this.ACT !== "" && !/^([A-Z]{2,4})$/.test(this.ACT)) {
            console.error("Invalid ACT", this.ACT);
        }
        if (this.ACTtime !== "" && !/^(\d{1,2}\.\d{2})$/.test(this.ACTtime)) {
            console.error("Invalid ACT time", this.ACTtime);
        }
    }
}

function processHeader(info: [string, number, number][]) {
    let currLine = info[0][2]; // y value of currently set row
    const trip = new Trip(info[1][0]); // each pdf is translated to one Trip object
    let i = 2;

    for (; info[i][1] !== info[0][1]; i++) {
        // this loop scans and stores data in the header row
        if (info[i][0] === "BASE" && /^([A-Z]{3})$/.test(info[i + 1][0])) {
            // base
            trip.base = info[++i][0]; // take last 3 characters of the string
        } else if (info[i][0] === "SEL" && /^(\d{1,4})$/.test(info[i + 1][0])) {
            // SEL number
            trip.sel = info[++i][0];
        } else if (/^(DOM|INT)$/.test(info[i][0]) && /^([A-Z0-9]{3})$/.test(info[i + 1][0])) {
            trip.div = info[i][0];
            trip.fleet = info[++i][0];
        } else if (info[i][0] === "ORG" && info[i + 1][0] === "SCH") {
            trip.original = true; // original schedule
            i++;
        } else if (info[i][0] === "IPD") {
            trip.IPD = true;
        } else {
            console.error("Unknown data:", info[i][0]);
        }
    }

    return { trip, index: i };
}

function processCrew(info: [string, number, number][], i: number, trip: Trip) {
    let name = "";
    let empNbr = "";
    let additionalInfo = [];
    let comments = "";
    let position = info[i++][0];

    if (info[i][0] !== "OPEN") {
        // iterate through the line until the EMP NBR is found to get each string in the name
        while (info[i][0] !== "EMP" || info[i + 1][0] !== "NBR") {
            name += info[i++][0];
        }
        i += 2;
        empNbr = info[i][0];
        if (info[i][2] === info[++i][2]) {
            comments = info[i++][0];
        }
    } else {
        name = "OPEN";
        empNbr = "";
        i++;
    }

    additionalInfo = [];
    // check for additional comments indented and on the next line
    while (
        !/^(.{3,4})$/.test(info[i][0]) &&
        !(info[i][0] === "DT" && info[i + 1][0] === "EQ") &&
        !/^(ETB-[YN])$/.test(info[i][0])
    ) {
        additionalInfo.push(info[i++][0]);
    }
    trip.addCrew(name.trim(), empNbr, position, comments, additionalInfo);

    return i;
}

function getTableHeaders(info: [string, number, number][], i: number, avgWidth: number) {
    // Process flight table
    // check that all column labels can be found, and find their x position
    const colVals = {
        DTcol: -1,
        EQcol: -1,
        FLTcol: -1,
        DSTAcol: -1,
        DEPcol: -1,
        Mcol: -1,
        ASTAcol: -1,
        ARRcol: -1,
        ACcol: -1,
        FLYcol: -1,
        GTRcol: -1,
        GRDcol: -1,
        ACTcol: -1,
    };
    colVals.DTcol = info[i][0] === "DT" ? info[i++][1] : (console.error("No DT col found!"), -1);
    colVals.EQcol = info[i][0] === "EQ" ? info[i++][1] : (console.error("No EQ col found!"), -1);
    colVals.FLTcol = info[i][0] === "FLT" ? info[i++][1] + avgWidth * 3 : (console.error("No FLT col found!"), -1);
    colVals.DSTAcol = info[i][0] === "STA" ? info[i++][1] : (console.error("No DSTA col found!"), -1);
    colVals.DEPcol = info[i][0] === "DEP" ? info[i++][1] : (console.error("No DEP col found!"), -1);
    colVals.Mcol = info[i][0] === "M" ? info[i++][1] : (console.error("No M col found!"), -1);
    colVals.ASTAcol = info[i][0] === "STA" ? info[i++][1] : (console.error("No ASTA col found!"), -1);
    colVals.ARRcol = info[i][0] === "ARR" ? info[i++][1] : (console.error("No ARR col found!"), -1);
    colVals.ACcol = info[i][0] === "AC" ? info[i++][1] : (console.error("No AC col found!"), -1);
    colVals.FLYcol = info[i][0] === "FLY" ? info[i++][1] + avgWidth * 4 : (console.error("No FLY col found!"), -1);
    colVals.GTRcol = info[i][0] === "GTR" ? info[i++][1] + avgWidth * 4 : (console.error("No GTR col found!"), -1);
    colVals.GRDcol = info[i][0] === "GRD" ? info[i++][1] + avgWidth * 4 : (console.error("No GRD col found!"), -1);
    colVals.ACTcol = info[i][0] === "ACT" ? info[i++][1] : (console.error("No ACT col found!"), -1);
    return { colVals, tableIndex: i };
}

function processFlight(
    info: [string, number, number][],
    i: number,
    flightLeg: Flight[],
    colVals: { [key: string]: number },
    avgWidth: number,
) {
    let currLine = info[i][2]; // all data for this plan will be found on this y level
    const flight = new Flight(info[i][0]);
    // loop through all cells for the current row
    while (currLine === info[++i][2]) {
        // check what column the current cell lines up with
        if (flight.DT === "" && Math.abs(info[i][1] - colVals.DTcol) < 0.01) {
            flight.DT = info[i][0];
        } else if (flight.EQ === "" && Math.abs(info[i][1] - colVals.EQcol) < 0.01) {
            flight.EQ = info[i][0];
        } else if (
            flight.FLT === "" && // apply special math for columns with variable cell lengths
            Math.abs(info[i][1] + avgWidth * info[i][0].length - colVals.FLTcol) < 0.01
        ) {
            flight.FLT = info[i][0];
        } else if (flight.DSTA === "" && Math.abs(info[i][1] - colVals.DSTAcol) < 0.01) {
            flight.DSTA = info[i][0];
        } else if (flight.DEP === "" && Math.abs(info[i][1] - colVals.DEPcol) < 0.01) {
            // this logic is necessary because sometimes DEP and M share a cell
            if (info[i][0].length > 4) {
                flight.DEP = info[i][0].slice(0, 4);
                flight.depRev = true;
                if (info[i][0].length === 6) {
                    flight.M = info[i][0].slice(5, 6);
                }
            }
        } else if (flight.M === "" && Math.abs(info[i][1] - colVals.Mcol) < 0.01) {
            flight.M = info[i][0];
        } else if (flight.ASTA === "" && Math.abs(info[i][1] - colVals.ASTAcol) < 0.01) {
            flight.ASTA = info[i][0];
        } else if (flight.ARR === "" && Math.abs(info[i][1] - colVals.ARRcol) < 0.01) {
            // ARR and AC can also share a cell
            if (info[i][0].length === 7) {
                flight.ARR = info[i][0].slice(0, 4);
                flight.arrRev = true;
                flight.AC = info[i][0].slice(5, 7);
            } else if (info[i][0].length === 6 && info[i][0][5] === "*") {
                flight.ARR = info[i][0].slice(0, 4);
                flight.arrRev = true;
                flight.AC = "*";
            } else {
                flight.ARR = info[i][0];
            }
        } else if (flight.AC === "" && Math.abs(info[i][1] - colVals.ACcol) < 0.01) {
            // AC and FLY can also share a cell
            if (info[i][0].length === 7) {
                flight.AC = info[i][0].slice(0, 2);
                flight.FLY = info[i][0].slice(2, 7);
            } else {
                flight.AC = info[i][0];
            }
        } else if (
            flight.FLY === "" &&
            // FLY column has some real weird shenanigans and is justified depending on it's length
            ((match) => match && Math.abs(info[i][1] + avgWidth * match[1].length - colVals.FLYcol) < 0.01)(
                /^(\d{1,2}\.\d{2})(?:[A-Z]{2}|RPRT)?$/.exec(info[i][0]),
            )
        ) {
            flight.FLY = info[i][0];
        } else if (flight.GTR === "" && Math.abs(info[i][1] + avgWidth * info[i][0].length - colVals.GTRcol) < 0.01) {
            flight.GTR = info[i][0];
        } else if (flight.GRD === "" && Math.abs(info[i][1] + avgWidth * info[i][0].length - colVals.GRDcol) < 0.01) {
            flight.GRD = info[i][0];
        } else if (flight.ACT === "" && Math.abs(info[i][1] - colVals.ACTcol) < 0.01) {
            flight.ACT = info[i][0];
        } else if (flight.ACT === "" && Math.abs(avgWidth * 2 + info[i][1] - colVals.ACTcol) < 0.01) {
            // sometimes ACT column also has a number in it which casuses it to be justified wrong
            flight.ACT = info[i++][0];
            flight.ACTtime = info[i][0];
        } else if (flight.ACT === "" && Math.abs(info[i][1] - avgWidth * 4 - colVals.ACTcol) < 0.01) {
            // or ACT can be justified 4 spaces to the right (XH) for some odd reason
            flight.ACT = info[i][0];
        } else {
            console.error("No column found for value:", info[i][0], info[i][1], colVals.FLTcol);
        }
    }
    flight.validateFlight(); // run the function to check that all cells fit the expected format
    flightLeg.push(flight);

    return i;
}

function processDPHeader(info: [string, number, number][], i: number, flightArr: Flight[][]) {
    // Process duty period information
    // duty period data header line
    if (!/^(EST|GTR|SKD)$/.test(info[++i][0])) {
        console.error("Unable to recognize duty period type.");
        return { index: -1 };
    }
    const dp = info[i++][0];
    if (!/^(\d{1,2}\.\d{2})$/.test(info[i][0])) {
        // validate duty period time
        console.error("Invalid duty period time.");
        return { index: -1 };
    }
    const dpTime = info[i++][0];
    if (info[i++][0] !== "P/C") {
        console.error("P/C header not found.");
        return { index: -1 };
    }
    if (!/^(\d{1}\.\d{2}[A-Z]?)$/.test(info[i][0])) {
        console.error("Invalid P/C time.");
        return { index: -1 };
    }
    const pcTime = info[i++][0];
    if (info[i++][0] !== "TL") {
        console.error("TL header not found.");
        return { index: -1 };
    }
    if (!/^(\d{1,2}\.\d{2})$/.test(info[i][0])) {
        console.error("Invalid total time.");
        return { index: -1 };
    }
    const tlTime = info[i++][0];

    // Construct duty period
    const dutyPeriod = new DutyPeriod(dp, dpTime, pcTime, tlTime, flightArr); // create duty period object from header row

    return { dutyPeriod, index: i };
}

function processDPFooter(info: [string, number, number][], i: number, dutyPeriod: DutyPeriod) {
    dutyPeriod.FDPT = info[i++][0];
    if (info[i][0] !== "START" || !/^(\d{4})$/.test(info[++i][0])) {
        console.error("Start hours not found.");
        return -1;
    }
    dutyPeriod.startTime = info[i++][0];
    if (info[i][0] !== "END" || !/^(\d{4})$/.test(info[++i][0])) {
        console.error("End hours not found.");
        return -1;
    }
    dutyPeriod.endTime = info[i++][0];
    if (info[i][0] !== "ACC" || info[++i][0] !== "STA" || !/^([A-Z]{3})$/.test(info[++i][0])) {
        console.error("ACC STA not found.");
        return -1;
    }
    dutyPeriod.accsta = info[i++][0];
    // check if there is an RSV FDP field (appears indented on next line)
    if (info[i][0] === "RSV" && info[i + 1][0] === "FDP" && info[i + 2][0] === "BEGAN") {
        i += 3;
        dutyPeriod.rsvBegan = info[i++][0];
        if (info[i++][0] === "ENDS") {
            dutyPeriod.rsvEnds = info[i++][0];
        }
    }

    return i;
}

function processDutyDay(info: [string, number, number][], i: number, dutyPeriod: DutyPeriod) {
    let dpType = "";
    let currLine = info[i][2];
    if (/^([A-Z]{3})$/.test(info[i][0]) && info[i + 1][0] === "ONDUTY") {
        dpType = info[i][0];
        i += 2;
    } else if (info[i][0] === "U/S") {
        dpType = "U/S";
        i++;
    }
    const dutyTimeInfo: OnDutyLine = {
        type: dpType,
        onDutyTime: "",
        odlTime: "",
        expTime: "",
        expType: "",
        siData: "",
        rlsData: "",
        rangeType: "",
    };
    if (dpType !== "") {
        dutyTimeInfo.onDutyTime = info[i][0];
        currLine = info[i++][2];
    }
    // parse additional data on the ONDUTY line like ODL, SI, and EXP
    for (; info[i][2] === currLine; i++) {
        if (info[i][0] === "ODL" && /^(\d{1,2}\.\d{2})$/.test(info[i + 1][0])) {
            dutyTimeInfo.odlTime = info[++i][0];
        } else if (info[i][0] === "EXP" && /^(\d{1,2}\.\d{2})$/.test(info[i + 1][0])) {
            dutyTimeInfo.expTime = info[++i][0];
            if (/^(I|TAXABLE)$/.test(info[i - 2][0])) {
                dutyTimeInfo.expType = info[i - 2][0];
            }
        } else if (info[i][0] === "SI" && /^(\d{4}\/\d{2})$/.test(info[i + 1][0])) {
            dutyTimeInfo.siData = info[++i][0];
        } else if (info[i][0] === "RLS" && /^(\d{4}\/\d{2})$/.test(info[i + 1][0])) {
            dutyTimeInfo.rlsData = info[++i][0];
        } else if (/^(NR|MR|LR|XL)$/.test(info[i][0])) {
            dutyTimeInfo.rangeType = info[i][0];
        } else if (!/^(I|TAXABLE)$/.test(info[i][0])) {
            console.error("Unknown identifier:", info[i][0]);
            return -1;
        }
    }
    dutyPeriod.onDutyInfo.push(dutyTimeInfo);
    return i;
}

function processDutyPeriod(
    info: [string, number, number][],
    i: number,
    trip: Trip,
    colVals: { [key: string]: number },
    avgWidth: number,
) {
    let flightArr: Flight[][] = []; // array of flight legs
    let flightLeg: Flight[] = []; // array  of flight schedules for a single leg
    // loop through the flight table
    while (info[i][0] !== "D/P") {
        // start an array for a leg if SKD is found (only one SKD row per leg)
        if (info[i][0] === "SKD") {
            if (flightLeg.length !== 0) {
                flightArr.push(flightLeg);
            }
            flightLeg = [];
        }
        if (/^([A-Z]{3})$/.test(info[i][0])) {
            i = processFlight(info, i, flightLeg, colVals, avgWidth);
        } else {
            console.error("Invalid flight row format.");
            i++;
        }
    }
    flightArr.push(flightLeg);

    const { dutyPeriod, index } = processDPHeader(info, i, flightArr);
    if (index === -1 || dutyPeriod === undefined) {
        return -1;
    }
    i = index;

    // capture HALF DAY COUNT line
    if (info[i][0] === "HALF" && info[i + 1][0] === "DAY" && info[i + 2][0] === "COUNT") {
        i += 2;
        let currLine = info[i++][2];
        // loop through multiple airports on half day count line
        while (info[i][2] === currLine) {
            if (!/^([A-Z]{3})$/.test(info[i][0]) || !/^(\d)$/.test(info[i + 1][0])) {
                console.error("Invalid half day airport or time.");
            }
            // there can be multiple airports and times on the half day count line
            dutyPeriod.pushHalfDay(info[i++][0], info[i++][0]);
        }
    }
    // loop for parsing ONDUTY lines
    while (info[i + 1][0] === "ONDUTY" || info[i][0] === "U/S" || info[i][1] !== info[0][1]) {
        i = processDutyDay(info, i, dutyPeriod);
        if (i === -1) {
            return -1;
        }
    }
    // It is possible there is no FDPT line for a deadhead D/P
    if (info[i][0] === "FDPT" && /^(\d{1,2}\.\d{2})$/.test(info[i + 1][0])) {
        i = processDPFooter(info, ++i, dutyPeriod);
        if (i === -1) {
            return -1;
        }
    }
    // push D/P to trip list
    trip.dutyPeriods.push(dutyPeriod);

    return i;
}

function processFooter(info: [string, number, number][], i: number, trip: Trip) {
    if (info[i][0] === "AB" && info[i + 1][0] === "SEQ") {
        trip.ABSEQ = info[i + 2][0];
        i += 3;
    }
    if (info[i++][0] !== "SEQ") {
        console.error("Footer line not found.");
        return -1;
    }
    // read footer line
    if (!/^(EST|GTR|SKD)$/.test(info[i][0]) || !/^(\d{1,2}\.\d{2})$/.test(info[i + 1][0])) {
        console.error("Flying hours not found.");
        return -1;
    }
    trip.flightTimeType = info[i++][0];
    trip.flightTime = info[i++][0];
    if (info[i][0] === "P/C" && /^(\d{1,2}\.\d{2})$/.test(info[++i][0])) {
        trip.pcTime = info[i++][0];
    } else {
        console.error("P/C hours not found.");
        return -1;
    }
    if (info[i][0] === "TL" && /^(\d{1,2}\.\d{2})$/.test(info[++i][0])) {
        trip.tlTime = info[i++][0];
    } else {
        console.error("Total hours not found.");
        return -1;
    }
    if (info[i][0] === "PTL" && /^(\d{1,2}\.\d{2})$/.test(info[++i][0])) {
        trip.ptlTime = info[i++][0];
    }
    if (info[i][0] === "TAFB" && /^(\d{1,2}\.\d{2})$/.test(info[++i][0])) {
        trip.tafbTime = info[i++][0];
    } else {
        console.error("Time away from base not found.");
        return -1;
    }

    return i;
}

export function processInfo(info: [string, number, number][], avgWidth: number) {
    if (info[0][0] === "SEQ" && /^(\d{1,5})$/.test(info[1][0])) {
        // return trip object with header info
        const { trip, index } = processHeader(info);
        let i = index;

        // process crew
        // loop until the table header for flight data is reached
        while (info[i][0] !== "DT" || info[i + 1][0] !== "EQ") {
            // crew position names are 3-4 characters and not indented
            if (/^(.{3,4})$/.test(info[i][0]) && info[i][1] === info[0][1]) {
                i = processCrew(info, i, trip);
            } else if (/^(ETB-[YN])$/.test(info[i][0])) {
                if (info[i++][0].slice(-1) === "Y") {
                    trip.ETB = true;
                }
                if (info[i++][0].slice(-1) === "Y") {
                    trip.TTS = true;
                }
                if (info[i++][0].slice(-1) === "Y") {
                    trip.REDFLAG = true;
                }
            } else {
                console.error("Could not understand crew information");
            }
        }

        const { colVals, tableIndex } = getTableHeaders(info, i, avgWidth);
        i = tableIndex;

        if (Object.values(colVals).some((val) => val === -1)) {
            console.error("Cannot continue");
            return -1;
        }

        // loop through duty periods (until the footer line is reached)
        while (info[i][0] !== "SEQ" && !(info[i][0] === "AB" && info[i + 1][0] === "SEQ")) {
            i = processDutyPeriod(info, i, trip, colVals, avgWidth);
        }
        i = processFooter(info, i, trip);
        // return trip object to main program
        return trip;
    } else {
        console.error("Invalid table.");
        return -1;
    }
}
