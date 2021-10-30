/**
 * © Greg Farrell greg@gregfarrell.org 
 * Do as you wish with this code but please respect the IP of any authors for 
 * whose game you create a force builder using any of this code.
 * @license MIT
 */


var sizes = [350, 750, 1500, 3000,99999];
function sub_timeout(sub_units, div) {
    var dfd = jQuery.Deferred();
        setTimeout(function() {
                dfd.resolveWith(div, [sub_units]);
                    }, 1200);
        return dfd.promise();
}

function army_size_string() { // todo check this costs in the book!
    var cost =  parseInt($('#force_cost').text(),10);
    if (cost <= 350 ) {
        return 'Squad';
    }
    if (cost <= 750 ) {
        return 'Platoon';
    }
    if (cost <= 1500 ) {
        return 'Company';
    }
    return 'Battalion';
}
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
var my_uuid=0;
var listVehicles = null;
var listWeapons = null;

//$.getScript("vehicles.js", function(){
//
//});
//$.getScript("weapons.js", function(){
//
//});



function render_sub_units_to(sub) {
    // Check if it's a dynamically created sub-entry such as an atypical tank
    if ( sub.refer != undefined ) {
        var dynamic = new Array();
        var forceID, sectionID, unitID;
        var force;
        var i, j;
        for ( i=0; i<sub.refer.length; i++ ) {
            force = force_by_id(sub.refer[i][0]);
            sectionID = sub.refer[i][1];
            entryArray = sub.refer[i][2];
            for ( j=0; j<entryArray.length; j++ ) {
                dynamic.push(force.sections[sectionID-1].entries[entryArray[j]-1]);
                dynamic[dynamic.length-1].unique='true';
            }
        }
        $(this).html(render_entries(dynamic, true, false));
        // create the entries item and pass to render_entries
    } else {
        $(this).html(render_entries(sub, true, false));
    }
    $('body').append($(this));
    update_selectable($(this));
}

function perm(inArr, choose, callback, callback_arg) {
    var c = [];
    var found = false;
    var inner = function(tmpArray, choose_) {
        if ( found )
            return;
        if (choose_ === 0) {
            found = callback(c, callback_arg);
        } else {
            for (var i = 0; i < tmpArray.length; ++i) {
                var newArray;
                c.push(tmpArray[i]);
                newArray = tmpArray.slice(0);
                newArray.splice(i, 1);
                inner(newArray, choose_ - 1);
                c.pop();
            }
        }
    };
    inner(inArr, choose);
    return found;
}

function requires_match(item, requires) {
    for (var i=0; i<item.length; i++) {
        if ($.inArray(requires[i], item[i]) == -1)
            return false;
    }
    return true;
}

// DROP DOWN WITH FORCE SELECTION incl TOP BAR  ----->
// maybe make it get which value from a select?
function render_name(force) {
    var group=null;
    var text = "<div class='ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix'><div style='display:inline'><select id=forceChoice style='display:inline; float:left; margin-right:20px; margin-left:10px; height: 24px; width: 360px'>"; 
    for (var i=0; i<forces.length; i++) {
        if (group != forces[i].group) {
            if ( group !== null )
                text = text + "</optgroup>";
            group = forces[i].group;
            text = text + '<optgroup label="' + group + '">';
        }
        text = text + "<option value=" + forces[i].id;
        if (force.id == forces[i].id)
            text = text + " selected";
        text=text+">"+forces[i].name+"</option>";
    }
    if (/Mobi|Android/i.test(navigator.userAgent))
    text = text +"</select>O:&nbsp<p id='officer_count' style='display:inline; margin-right:20px;'>0</p>R:&nbsp<p id='restricted_count' style='display:inline; margin-right:20px;'>0</p>S:&nbsp<p id='scout_count' style='display:inline; margin-right:20px'>0</p>Cost:&nbsp<p style='display:inline' id='force_cost'>0</p></div><div style='display:inline; float:right'><div style=' margin-right:12px; display:inline; float=left'><button id='print' class='save_button'>&nbspPrint&nbsp</button><a class='save_button' style='float:left; margin-right:40px;' href='help.html'>&nbspHelp&nbsp</a><button id='load' class='save_button'>&nbspLoad&nbsp</button><button id='save' class='save_button'>&nbspSave&nbsp</button></div></div></div>";
    else
    text = text +"</select>Officers:&nbsp<p id='officer_count' style='display:inline; margin-right:20px;'>0</p>Restricted:&nbsp<p id='restricted_count' style='display:inline; margin-right:20px;'>0</p>Scouts:&nbsp<p id='scout_count' style='display:inline; margin-right:20px'>0</p>Force cost:&nbsp<p style='display:inline' id='force_cost'>0</p></div><div style='display:inline; float:right'><div style=' margin-right:12px; display:inline; float=left'><button id='print' class='save_button'>&nbsp&nbspPrint&nbsp&nbsp</button><a class='save_button' style='float:left; margin-right:40px;' href='help.html'>&nbsp&nbspHelp&nbsp&nbsp</a><button id='load' class='save_button'>&nbsp&nbspLoad&nbsp&nbsp</button><button id='save' class='save_button'>&nbsp&nbspSave&nbsp&nbsp</button></div></div></div>";
    return(text);
}
// <<----- DROP DOWN WITH FORCE SELECTION incl TOP BAR

// MAIN TITLES WITH SECTIONS like INFANTRY UNITS, TANKS UNITS  ----->>
function render_sections(force, async) {
    var text="";
    for(var i = 0; i < force['sections'].length; i++) {
        text = text + "<div class='group'><h3 class='section_title'>" + force['sections'][i].name+"</h3>";
        text = text + "<div data-allows='"+ force['sections'][i].allows +"' class='section ui-widget ";
        if (force.sections[i].requires)
            text = text + "ui-state-disabled' data-requires='true'";
        else
            text = text + "selectable ' data-requires='false'";
        text = text + " id=section_" + (i+1) + " data-section-no="+ (i+1) + ">";
        text = text+render_entries(force['sections'][i]['entries'], false, async);
        text = text + "</div></div>";
    }
    return text;
}
// <<----- MAIN TITLES WITH SECTIONS like INFANTRY UNITS, TANKS UNITS


function get_allows() {
    var selected = $('.ui-selected').filter( function() {
        return ($(this).parent().data('allows')); //only entries with a data-allows field
    });
    var array = $.map(selected, function(a)
    { // take allows 'multiplier' into account when calculating allows
        var rv = [];
        for (var i=0; i<($(a).data('multiplier')); i++) {
            var allows = $(a).parent().data('allows');
            if ($.isArray(allows)) // use slice to copy by value
                rv.push(allows.slice());
                //rv.push($.extend(true, {}, allows));
            else
                rv.push([allows]);
        }
        return rv;
    });
    return array;
}
function count_allows() {
    var array = get_allows();
    var totals={};
    for (var i=0; i<array.length; i++){
        for (var j=0; j<array[i].length; j++){
            if (totals[array[i][j]])
                totals[array[i][j]]=totals[array[i][j]]+1;
            else
                totals[array[i][j]]=1;
        }
    }
    return totals;
}
function count_requires() {
    var selected = $('.ui-selected');
    var array = $.map(selected, function(a)
        { 
            if ($(a).parent().data('requires')) {
                var rv=[];
                for (var i=0; i<($(a).data('multiplier')); i++) {
                    rv.push($(a).parent().data('section-no'));
                }
                return rv;
            }
        });
    return array;
}
// if uniqueRequire is non-null then we will only remove this requirement
// rather than any that are in index
function reduce(allows, requires, index, max, uniqueRequire) {
    var indexArray = index.split(',');
    var localMax = max;
    for (var i=allows.length-1; i >= 0 && localMax > 0; i--){
        if (allows[i] == index) {
            allows.splice(i,1);
            localMax--;
        }
    }
    for (i=requires.length-1, localMax=max; i >= 0 && localMax > 0; i--){
        if ((uniqueRequire===null || requires[i] == uniqueRequire) && $.inArray(""+requires[i],indexArray) != -1) {
            requires.splice(i,1);
            localMax--;
        }
    }
}
// Remove any allows/requires pairs that have sufficient allows
function reduce_by_count(allows, requires) {
    var count = {};
    var requiresCount= {};
    var found = false;
    for (var i=0;i<allows.length; i++){
        if (!count[allows[i]])
            count[allows[i]]=1;
        else
            count[allows[i]] = count[allows[i]]+1;
    }
    for(var index in count) {
        var indexArray = index.split(',');
        for (var j=0; j<requires.length; j++) {
            if ($.inArray(""+requires[j], indexArray) != -1) {
                if (!requiresCount[index])
                    requiresCount[index]=1;
                else
                    requiresCount[index]=requiresCount[index]+1;
            }
        }
    }
    for (index in count){
        if (requiresCount[index] <= count[index]) {
            found = true;
            reduce(allows, requires, index, count[index], null);
        } else if ( index.split(',').length == 1) {
            reduce(allows, requires, index, count[index], null);
            found = true;
        }
    }
        
    if (found) // reduced, so try to reduce again
        reduce_by_count(allows, requires);
    /*alert(JSON.stringify(count));
    alert(JSON.stringify(requiresCount)); */
    return found;
}
// Reduce allow array entry to lowest common denominator
// by removing any sub-allows that are not required
function simplify_allows(allows, requires) {
    var changed = false;
    for (var i=allows.length-1; i>=0; i--) {
        for (var j=allows[i].length-1; j>=0; j--) {
            if ($.inArray(allows[i][j], requires) ==-1) {
                allows[i].splice(j,1);
                changed = true;
            }
        }
        if (allows[i].length === 0) {
            allows.splice(i,1);
        }
    }
    return changed;
}
// Check for a requires that exists in only 1 allows
function simplify_requires(allows, requires){
    var changed=false;
    var uniqueRequires={};
    var uniqueAllows={};
    var countRequires={};
    var countAllows={};
    for (var i=0; i<requires.length; i++){
        if (!uniqueRequires[requires[i]]) {
            uniqueRequires[requires[i]]=requires[i];
            countRequires[requires[i]]=1;
        } else {
            countRequires[requires[i]]++;
        }
    }
    for (i=0; i<allows.length; i++){
        if (!uniqueAllows[allows[i]]) {
            uniqueAllows[allows[i]]=allows[i];
            countAllows[allows[i]]=1;
        } else {
            countAllows[allows[i]]++;
        }
    }
    for (var rKey in uniqueRequires){
        var count=0;
        var index=null;
        for (var aKey in uniqueAllows){
            if ($.inArray(uniqueRequires[rKey], uniqueAllows[aKey]) != -1){
                count++;
                index=aKey;
            }
        }
        if (count == 1){
            var howMany=countRequires[rKey];
            if (countAllows[aKey] < howMany)
                howMany = countAllows[aKey];

            changed=true;
            reduce(allows, requires, index, howMany, rKey); // only remove this rKey
            break;
        }
    }
    return changed;
}

function allow_requires() {
    var requires = count_requires();
    if (requires.length === 0) // no requirements, auto pass
        return true;
    var allows = get_allows();
    if (requires.length > allows.length)
        return false;

    for (var i=0; i<requires.length; i++) {
        var match = false;
        for (var j=0; j<allows.length && match===false; j++){
            if ($.inArray(requires[i], allows[j]) != -1)
                match = true;
        }
        if (match === false) {
            return false;
        }
    }
    // loop simplifying until it simplifies no more
    while ( requires.length > 0 && (simplify_allows(allows, requires) || simplify_requires(allows, requires) || reduce_by_count(allows, requires) )){
    }
    if (requires.length === 0)
        return true;
    if ( allows.length > 0 && requires.length <= allows.length ) {
        alert('Simplifaction process failed. If using the online (ie uptodate copy) then please report the following string to "quozl" on the guild gamers forum. Your feedback can help improve this builder!:' +JSON.stringify(allows) + " requires: " +JSON.stringify(requires));
        return perm(allows, requires.length, requires_match, requires);
    }
    return false;
}

function allow_removed() {
    var requires = $('.section').filter( function() { return $(this).data('requires'); } );
    $(requires).addClass('ui-state-disabled');
    $(requires).removeClass('selectable');
}

function allow_enables() {
    var allows = count_allows();
    for (var key in allows) {
        var section = $('#section_'+key);
        section.removeClass('ui-state-disabled');
        section.addClass('selectable');
        // greg section.css('background:EEE');
    }
    update_selectable();
    update_accordion();
}

// UNIT BOXES ----->>
function render_entries(entries, sub_entries, async) {
    var text="";
    var unit_cost;
    for(var i = 0; i < entries.length; i++) {
        var count = 1;
        if (entries[i].count) {
            count = entries[i].count;
        }
        for (var count_loop=0; count_loop<count; count_loop++) {
            text = text + "<div data-multiplier='";
            if (entries[i].multiplier)
                text = text + entries[i].multiplier;
            else {
                if (entries[i].multiplier === 0)
                    text = text + "0";
                else
                    text = text + "1";
            }
            text = text + "' data-bg_id='" + (i+1);
            if ( entries[i]['sub_units'] ) {
                var id = my_uuid++;
                var div = $('<div>').addClass('selectable sub_div hidden');
                $(div).uniqueId();
                $(div).data('sub_parent','id'+id);
                text = text + "' data-sub='" + $(div).attr('id') + "' id='id"+id;
                // Do not populate sub panel asynchronously if async == false
                // This is important if we are loading a saved list as we will
                // need panel contents immediately
                if ( async )
                    jQuery.when( sub_timeout(entries[i]['sub_units'], div)).done(render_sub_units_to);
                else
                    render_sub_units_to.apply(div, [entries[i]['sub_units']]);
            }
            if (sub_entries)
                text = text + "' data-sub_entry='true";
            if (entries[i].officer)
                text = text + "' data-officer='"+entries[i].officer;
            if (entries[i].scout)
                text = text + "' data-scout='"+entries[i].scout;
            if (entries[i].restricted)
                text = text + "' data-restricted='true";
            if (entries[i].unique)
                text = text + "' data-unique='true";
            if (entries[i].p)
                text = text + "' data-p='"+entries[i].p;
            if (entries[i].s)
                text = text + "' data-s='"+entries[i].s;
            if (entries[i].v)
                text = text + "' data-v='"+entries[i].v;
            if (entries[i].vc)
                text = text + "' data-vc='"+entries[i].vc;
            if (entries[i].w)
                text = text + "' data-w='"+entries[i].w;
            text = text + "' class='entry ui-widget-content";
            if ( entries[i]['origin_brit'] )
                text = text + ' ui-widget-background';
            if ( entries[i]['mandatory'] )
                text = text + ' ui-selected mandatory';
            if ( entries[i].cost == undefined )
                unit_cost = 0;
            else
                unit_cost = entries[i].cost;
            text = text + "'><div><p class='entry_name'>&nbsp"+entries[i].name+"</p><p id='cost' data-initial-cost='"+unit_cost+"' class='entry_cost'>"+unit_cost+"</p><p class='entry_cost' id='br' data-initial-br='"+entries[i].br+"'>"+entries[i].br+"<font size='1.2em'>BR</font></p></div>";
            if ( entries[i]['options'] ) {
                for(var j = 0; j < entries[i]['options'].length; j++) {
                    text = text + '<div class="choice ui-helper-clearfix"><p class="opt_text">&nbsp'+entries[i]['options'][j]['name']+'</p><select class="opt_select" name="' + entries[i]['options'][j]['name']+ '" data-bg_id="' + (j+1) +  '">';
                    for (var k=0; k<entries[i].options[j].choices.length; k++) {
                        if ( entries[i].options[j].choices[k].cost!== undefined )
                            text = text + "<option data-cost='" + entries[i].options[j].choices[k].cost;
                        else
                            text = text + "<option data-cost='0";
                        if (entries[i].options[j].choices[k].np)
                           text = text +"' data-np='"+entries[i].options[j].choices[k].br; 
                        if (entries[i].options[j].choices[k].br)
                           text = text +"' data-br='"+entries[i].options[j].choices[k].br; 
                        if (entries[i].options[j].choices[k].v)
                           text = text +"' data-v='"+entries[i].options[j].choices[k].v; 
                        if (entries[i].options[j].choices[k].vc)
                           text = text +"' data-vc='"+entries[i].options[j].choices[k].vc; 
                        if (entries[i].options[j].choices[k].vcd)
                           text = text +"' data-vcd='"+entries[i].options[j].choices[k].vcd; 
                        if (entries[i].options[j].choices[k].w)
                           text = text +"' data-w='"+entries[i].options[j].choices[k].w; 
                        if (entries[i].options[j].choices[k].restricted)
                           text = text +"' data-restricted='"+entries[i].options[j].choices[k].w; 
                        text = text + "' value='" + (k+1) +"'>"+entries[i].options[j].choices[k].text + "</option>"; 
                    }
                    text = text + "</select></div>";
                }
            }
            if ( entries[i]['sub_units'] ) {
                text = text + "<button class='sub_button'";
                if ( entries[i]['sub_heading'] )
                    text = text + " data-sub_heading='" + entries[i]['sub_heading'] + "'";
                text = text + ">"+entries[i]['sub_text']+"</button>";
            }
            if ( entries[i]['warning'] )
                text = text + "<div><span style='display:inline-block; width:100%; background-color:A80000;'>"+entries[i]['warning']+"</span></div>";
            text = text + "</div>";
        }
    }
    return text;
}
// <<----- UNIT BOXES



function force_by_id(which) {
    for (var i=0; i<forces.length; i++){
        if (which == forces[i].id)
            return forces[i];
    }
    return forces[0];
}
function render_force(which, async) {
    var text="";
    var force = force_by_id(which);
    text = render_name(force);
    text = text + "<div id='accordion'>" + render_sections(force, async) + "</div>";
    $('#main').data('bg_id', which);
    $('#main').html(text);
}

// return -1 on error character
function decode( character ) {
    if (typeof(character)==='undefined')
        return -1;

    var code = character.charCodeAt(0);

    if ( code >= 65 && code <= 90 )
        return character.charCodeAt(0) - 64;
    else if ( code >= 97 && code <= 122 )
        return character.charCodeAt(0) - 70;
    return -1;
}

function encode( integer ){
    if ( integer >= 0 && integer <= 26 )
        return String.fromCharCode(64+integer);
    if ( integer >= 27 && integer <= 52 )
        return String.fromCharCode(97+integer);
    return '!';
}

function split_and_load(items, depth, panel) {
    // Split on 0, then 1, then 2 etc as we go deeper
    var list = items.split(String.fromCharCode(depth+48));
    for (var i=0; i<list.length; i++) {
        if(typeof(panel)==='undefined') {
            var section_number = decode(list[i][0]);
            section = $('.section').filter( function() {
                if ($(this).data('section-no') == section_number){
                    return true;
                }
                return false;
            });
            // skip the first entry - the section code
            load_item(list[i].slice(1), depth, section[0]);
        } else {
            load_item(list[i], depth, panel);
        }
    }
}

function load_item(item, depth, panel) {
    var entry_count = 0; // is it instance N of this entry?
    var pointer=0; // index into item where current data coming from
    var sub_delim = String.fromCharCode(49+depth);
    var section = null;

    if(typeof(panel)==='undefined') {
        var section_number = decode(item[0]);
        pointer++;
        section = $('.section').filter( function() {
            if ($(this).data('section-no') == section_number){
                return true;
            }
            return false;
        });
    } else {
        section = panel;
    }
    var entry_number = decode(item[pointer]);
    var entries = $(section).children('.entry').filter( function() {
        if ($(this).data('bg_id') == entry_number) {
            return true;
        }
        return false;
    });
    if ( item[pointer+1] == '_' ) { // see if this refers to the Nth one of this entry
        pointer = pointer +2;
        var count = decode(item[pointer]);
        if ( count > 0 ) {
            entry_count = count-1; // zero-base
        }
    }
    enable_entry(entries[entry_count]);
    pointer ++;
    // check for any option selects
    while ( item[pointer] == '-' ) {
        var which = decode(item[pointer+1]);
        var value = decode(item[pointer+2]);
        pointer = pointer +3;
        $(entries[entry_count]).find('select').each( function() {
            if ($(this).data('bg_id') == which ) {
                $(this).val(value);
                $(this).change(); // triggers the update cost code
            }
        });
    }
    if ( item[pointer] == sub_delim ) { // sub entries
        var endPointer = item.indexOf(sub_delim, pointer+1);  // find the next sub-delim
        var sub = $('#'+$(entries[entry_count]).data('sub'));
        // If the parent has been rendered not duplicated then it will have
        // no subID. We need to set one so that we can count selected sub elements
        if (!$(entries[entry_count]).attr('id')) {
            $($(entries[entry_count])).uniqueId();
            $(sub).data('sub_parent', $(entries[entry_count]).attr('id'));
        }

        pointer++;

        if ( endPointer > pointer ) {
            load_item(item.slice(pointer, endPointer), depth+1, sub);
            pointer = endPointer+1;
        } else {
            alert('sub div test endPointer>pointer failed');
        }
    }

    if (pointer < item.length)
        load_item(item.slice(pointer), depth, panel);
}

function load( string ) {
    render_force(decode(string[0]), false);
    split_and_load(string.slice(1), 0);
}

function render() {
    var toLoad = getURLParameter('load');
    if (toLoad) {
        merge(); // need data merged by this point to be able to use in load
        load(toLoad);
        if (getURLParameter('roster'))
            print_render();
    }
    else
        render_force(1, true);
}

// Function gets selected entries but excludes any sub entries whose parent entry
// is currently un-selected
function get_selected_entries() {
    return $('.ui-selected').filter( function() {
        // check if they are a sub entry - if so require all parent entries to be selected
        var which = $(this);
        while (which.data('sub_entry')) {
            if ( ! $(which).parents('.ui-selectable').data('sub_parent') || 
                ! $('#'+$(which).parents('.ui-selectable').data('sub_parent')).hasClass('ui-selected')) {
                    return false;
                    }
            which = $('#'+$(which).parents('.ui-selectable').data('sub_parent'));
        }
        return true; } );
}
// returns 1 if not enough infantry and 2 if too many
function enough_squads(squads, platoons, cost) {
    // need to check force specific platoon restrictions
    var forceId = parseInt($('#forceChoice').val(),10);
    var size = 0;
    rv = 0;
    for (var i=0; i<sizes.length; i++) {
        if (cost < sizes[i]) {
           size = i;
           break;
        }
    }
    var min = forces[forceId].infantry[size][0];
    var max = forces[forceId].infantry[size][1];
    if ( min[0] ) {
        if ( squads < min[0] && platoons === 0 )
            return 1;
    }
    if ( min[1] ) {
        if ( platoons < min[1] )
            return 1;
    }
    if ( max[0] ) {
        if ( platoons > min[0] )
            return 2;
    }
    if ( max[1] ) {
        if ( platoons > min[1] )
            return 2;
    }
    return 0;
}
function squads_check(cost, entries) {
    var squads = 0;
    var platoons = 0;
    var rv;
    $(entries).each(function() {
        if ($(this).data('s'))
            squads++;
        if ($(this).data('p'))
            platoons++;
    });
    rv = enough_squads(squads, platoons, cost);
    if ( rv == 1 )
        alert('greg WIP');

}
function update_cost() {
    var cost = 0;
    var br=0;
    var d6s=0;
    var entries = get_selected_entries();
    var officer_count = 0;
    var scout_count = 0;
    $(entries).each(function() {
        cost = cost + parseInt($(this).find('#cost').text(),10);
        var brEntry = $(this).find('#br').text();
        if ( brEntry == 'D6BR' )
            d6s++;
        else
            br = br + parseInt(brEntry,10);
        if ($(this).data('officer')) {
            if ($(this).data('officer') === true )
                officer_count++;
            else
                officer_count = officer_count + $(this).data('officer');
        }
        if ($(this).data('scout')) {
            if ($(this).data('scout') === true )
                scout_count++;
            else
                scout_count = scout_count + $(this).data('scout');
        }
    });
 
    if ( d6s == 0 )
        $('#force_cost').text(cost + ' / ' + br +'br');
    else
        $('#force_cost').text(cost + ' / ' + br + '+'+d6s+'D6 br');
 
    $('#officer_count').text(officer_count);
    $('#scout_count').text(scout_count);
 
    var restricted = entries.filter( 
        function() {
            if ($(this).data('restricted'))
                return true;
            // also filter for any entries that have 'restricted' on their selected options
            var selects = $(this).find("select option").filter(':selected');
            for (var i=0; i<selects.length; i++) {
                if ($(selects[i]).data('restricted')){
                    return true;
                }
            }
            return false;
        });
 
    $('#restricted_count').text(restricted.length);
 
    //greg WIP squads_check(cost, entries);
}

function unselecting(event, ui){
    var abort = false;
    // If removing this would stop us meeting our requires, then prevent its removal
    if ($(ui.unselecting).hasClass('mandatory'))
        abort = true;
    else if ($(ui.unselecting).parents('.section').data('allows')) {
        if ( !allow_requires() ) {
            alert('Removing this item would result in you having more support choices than allowed.\nRemove those first.');
            abort=true;
        }
    }
    if (abort)
        $(ui.unselecting).addClass('ui-selected');

}
function unselected(){
    update_cost();
    allow_removed();
    allow_enables();
    update_accordion();
}

function duplicate_sub(dupe) {
    // If this dupe has sub units then also duplicate that sub div and
    // change the sub and parents reference to each others in the new clones
    var sub = $('#'+$(dupe).data('sub')).clone(false, false);
    $(sub).attr('id', null);
    $(sub).uniqueId();
    $(sub).data('sub_parent', $(dupe).attr('id'));
    $(sub).hide();
    $('body').append($(sub));
    $(dupe).data('sub', $(sub).attr('id'));
    // check if any of the duplicated sub-entries also have sub-entries
    $(sub).find('.entry').each( function() {
            if ($(this).data('sub')) {
                // Give each entry that will become a parent a unique ID
                $(this).attr('id', null);
                $(this).uniqueId();
                duplicate_sub(this);
            }
    });
}
function duplicate_entry(entry) {
    if ($(entry).data('unique') || $(entry).hasClass('mandatory'))
        return;
    var dupe = $(entry).clone(true, false);
    // set uniqueID
    $(dupe).attr('id', null);
    $(dupe).uniqueId();
    dupe.removeClass('ui-selected');
    $(entry).after(dupe);
    //Clone any sub div
    if ($(dupe).data('sub')) {
        duplicate_sub(dupe);
        update_selectable(); // could limit this to current section
    }
    // Ensure the duplicate's points/BR reflect its currently selected options
    update_entry_cost(dupe, true);
}

function enable_entry(entry) {
    duplicate_entry(entry);
    $(entry).addClass('ui-selected');
    update_cost();
    allow_enables();
}

function selected(event, ui){
    var abort=false;
    if ($(ui.selected).parents('.section').data('requires')) {
        if ( !allow_requires() ) {
            alert('Selecting this item would result in you having more support choices than allowed.');
            abort=true;
        }
    }
    if (abort) {
        $(ui.selected).removeClass('ui-selected');
    } else {
        enable_entry(ui.selected);
    }
}

function update_entry_cost(entry, noUpdateGlobal) {
    var cost_field = $(entry).find('p').filter( function() { return $(this).attr('id')=='cost'; });
    var br_field = $(entry).find('p').filter( function() { return $(this).attr('id')=='br'; });
    var selects = $(entry).find("select option").filter(':selected');
    var newCost = $(cost_field).data('initial-cost');
    var newBr = $(br_field).data('initial-br');

    for (var i=0; i<selects.length; i++) {
        newCost = newCost + $(selects[i]).data('cost');
        if ($(selects[i]).data('br')){
            newBr = newBr + $(selects[i]).data('br');
        }
    }
    $(cost_field).html(newCost);
    $(br_field).html(newBr+"<font size='1.2em'>BR</font>");
    if ( noUpdateGlobal === undefined || noUpdateGlobal === false )
        update_cost();
}

function option_change() {
    update_entry_cost($(this).parents(".entry"));
}


function update_accordion(){
    $("#accordion").accordion({
        heightStyle: "content",
        header: '> div > h3'
        }).sortable({
        axis: "y",
        handle: "h3",
        stop: function( event, ui ) {
            // IE doesn't register the blur when sorting
            // so trigger focusout handlers to remove .ui-state-focus
            ui.item.children( "h3" ).triggerHandler( "focusout" );
        }
    });
}

function update_selectable(arg)
{
    var selectables = null;
    if ( arg === undefined )
        selectables = $('.selectable');
    else
        selectables = $(arg);

    selectables.bind("mousedown", function(e) {
            e.metaKey = true;
            }).selectable({ filter: '.entry', tolerance: "fit", unselecting:unselecting, unselected:unselected, selected:selected }, 'refresh');
}

function sub_button_bind() {
    $('.sub_button').button();
    $('body').on('click', '.sub_button', function( event) {
        event.preventDefault();
        var parent = $(this).parent();
        var sub = $('#'+parent.data('sub'));
        var title = $(this).html();
        if ($(this).data('sub_heading'))
            title = $(this).data('sub_heading');
        sub.dialog({title:title, modal:true, width:'950'});
    });

}

function save_entry(entry, depth, N) {
    var text=[];
    text.push(encode($(entry).data('bg_id')));
    if (N > 1) // Save if this is the Nth of this entry
        text.push('_', encode(N));
    $(entry).find('select').each( function() {
        var num_opts = $(this).children('option').length;
        // only bother saving ones with more than 1 possible choice
        // and which are not the default value
        if (num_opts > 1 && $(this).val() > 1) {
            text.push( '-', encode($(this).data('bg_id')), encode(parseInt($(this).val(),10)));
        }
        });
    subID = $(entry).data('sub');
    if (subID) {
        var sub = $('#'+subID);
        text = text.concat(save_section( sub , depth+1));
    }
    return text;
}

function depth_seperator(depth) {
    return String.fromCharCode(48+depth);
}

function save_section(section, depth) {
    var entries = $(section).children('.ui-selected');
    // alert('entries length is ' + entries.length);
    var text = [];
    if ( entries.length > 0 ) {
        if (depth === 0) //only include section code for top level sections
            text.push(encode($(section).data('section-no')));
        else
            text.push(depth); // push sub section start marker for this depth
        for (var i=0; i<entries.length; i++) {
            var N=1;
            // need to determine if it's Nth instance of this entry and save that information
            if (i > 0 ) {
                var previous=0;
                var bg_id=$(entries[i]).data('bg_id');
                for (var j=0; j<i; j++){
                    if ($(entries[j]).data('bg_id') == bg_id)
                        previous++;
                }
                if (previous)
                    N = previous+1;
            }
            text = text.concat(save_entry(entries[i], depth, N));
        }
        text.push(depth);
    }
    return text;
}

function emptyPage() {
    $('#main').empty();
    $('.sub_div').remove();
}
//function saveDialog(text){
//    $('#save_div').html("<div class='ui-widget-content ui-corner-all' style='margin-bottom:8px;'><p>"+text+"</p></div><div class='ui-widget-content ui-corner-all'><p><a href='http://www.battlegroupbuilder.com?load="+text+"&roster=1'>Web-Link to share this force.</a></p></div>");
//    $('#save_div').dialog({title:'Save String', modal:true,
//        buttons: {
//            Close: function () {
//                $( this ).dialog( "close" );
//            }
//        }
//    });
//}
function loadDialog() {
    $('#load_div').dialog({title:"Load Force", modal:true,
    buttons: {
        Clear: function() {
            $('#load_input').val('');
        },
        Cancel: function() {
                    $( this ).dialog( "close" );
                },
        OK: function() {
                    $( this ).dialog( "close" );
                    emptyPage();
                    load($('#load_input').val());
                    $('.save_button, .load_button, .sub_button').button();
                }
        }
    });
}

function save() {
    var text = [];
    text.push(encode($('#main').data('bg_id')));
    var sections = $('.section').not('.ui-state-disabled');
    for (var i=0; i<sections.length; i++)
        text = text.concat(save_section(sections[i], 0));
    var saveText='';
    for (var j=0; j<text.length; j++)
        saveText = saveText + text[j];
    saveDialog(saveText);
}

function changeForce(){
    emptyPage();
    render_force(parseInt($(this).val(),10), true);
    $('.save_button, .load_button, .sub_button').button();
    update_accordion();
    update_selectable();
}
function print_header(force) {
    var text = "<div style='margin:0px auto; width:60%;'><h3 class='p_title p_h3' style='display:inline; padding:auto;'>"+ force.name + "</h3><h4 class='p_+h4' style='display:inline; float:right; margin:0px 10px;'>(Officers: "+$('#officer_count').text()+", Scouts: "+$('#scout_count').text()+")  Army Size: "+army_size_string()+"</h4><h4 class='p_+h4' style='display:inline; float:right; margin:0px;'>"+$('#force_cost').text()+"</div>";
    return text;
}
function print_with_sub(entry){
    var sub=$('#'+$(entry).data('sub'));
    var entries = $(sub).children('.ui-selected');
    var text="";
    for (var i=0; i<entries.length; i++){
        text = text + "<div class='p_entry'>"+print_entry(entries[i]) + "</div>";
    }
    return text;
}
function print_entry_name(entry){
    return "<div><h4 class='p_h4'>" + $(entry).find('.entry_name').text() +"</h4><p class='p_h4 right'>"+$(entry).find('#cost').text() + "/" + $(entry).find('#br').text() + "</p></div>";
}
function print_entry_options(entry){
    var text="<div><h5 class='p_h5'>";
    var selects = $(entry).find('.opt_select');
    var printed = 0;
    if ($(selects).length > 0) {
        $(selects).each( function() {
            var selected = $(this).children("select option").filter(':selected');
            if (!$(selected).data('np') && $(this).children("select option").filter(':selected').text()!='None') {
                if (printed > 0)
                    text = text+', ';
                text=text+$(this).children("select option").filter(':selected').text();
                printed = printed +1;
            }
        });
    }
    return text + "</h5></div>";
}
function addV(which, count) {
    if ( count < 1 )
        return;
    if ( listVehicles[which] )
        listVehicles[which] = listVehicles[which] + count;
    else
        listVehicles[which] = count;
}
function print_entry(entry){
    var text = print_entry_name(entry);

    // Find any vehicles used by these entries
    var v = $(entry).data('v');
    var vc = $(entry).data('vc');
    var vcd = null;
    var selects = $(entry).find("select option").filter(':selected');
    for (var i=0; i<selects.length; i++) {
        if ( $(selects[i]).data('v') ) {
            v = $(selects[i]).data('v');
        }
        if ( $(selects[i]).data('vc') ) {
            vc = $(selects[i]).data('vc');
        }
        if ( $(selects[i]).data('vcd') ) {
            vcd = $(selects[i]).data('vcd');
        }
    }
    if (v) {
        if ( !vc )
            vc = 1;
        if ( $.isArray(v) ){
            if ( vcd !== null ) {
                // Apply any vehicle count deltas. Used for some really awkward units.
                // First duplicate V so we don't modify the original
                vc = vc.slice(0);
                for (i=0; i<v.length; i++){
                    vc[i]=vc[i]+vcd[i];
                    if (vc[i] < 0)
                        vc[i]=0;
                }
            }

            for (i=0; i<v.length; i++)
                addV(v[i],vc[i]);
        } else 
            addV(v,vc);
    }
    var w = $(entry).data('w');
    if ( !w ) {
        selects = $(entry).find("select option").filter(':selected');
        for (i=0; i<selects.length; i++) {
            if ( $(selects[i]).data('w') )
                w = $(selects[i]).data('w');
        }
    }
    if (w)
        listWeapons[w]=1;

    text = text + print_entry_options(entry);
    if ($(entry).data('sub'))
        text = text + print_with_sub(entry);
    return text;
}
function print_section(section){
    var text="<div class='p_section'><h3 class='p_h3'>";
    text=text+$(section).parent('.group').find('.section_title').text()+"</h3>";
    var entries = $(section).children('.ui-selected');
    var withSub = $(entries).filter(function(){ if ($(this).data('sub')) return true; return false;});
    var withoutSub = $(entries).filter(function(){ if ($(this).data('sub')) return false; return true;});
    // print any with subs first for layout reasons
    for (var i=0; i<withoutSub.length; i++)
        text = text + "<div class='p_entry'>"+ print_entry(withoutSub[i]) +"</div>";
    for (i=0; i<withSub.length; i++)
        text = text + "<div class='p_parent'>"+ print_entry(withSub[i]) +"</div>";
    text=text+"</div>";
    return text;
}
function print_sections() {
    var sections = $('.section:has(.ui-selected)');
    var text="";
    for (var i=0; i<sections.length; i++) {
        text = text + print_section(sections[i]);
    }
    return text;
}
function print_weapons(listWeapons) {
    var text="";
    for (var key in listWeapons) {
        var weapon = weapons[key];
        var extendedRange=false;
        for (var i=0; i < weapon.stats.length; i++) {
            if (weapon.stats[i].strength.length==6)
                extendedRange = true;
        }
        text = text + '<table><tr><th>'+weapon.name+'</th><th>0"-10"</th><th>10"-20"</th><th>20"-30"</th><th>30"-40"</th><th>40"-50"</th>';
        if (extendedRange)
            text = text+'<th>50"-70"</th>';
        text = text + '</tr>';
        for (i=0; i < weapon.stats.length; i++) {
            var mode = weapon.stats[i];
            text = text + "<tr><td style='white-space:pre;'>"+mode.type;
            if ( mode.effect ) {
                text = text + " ("+mode.effect + ")</td>";
            } else if ( mode.effect == '') {
                text = text + " (   /  +)</td>";
            }
            for (var j=0; j<mode.strength.length; j++) {
                if (mode.strength[j] == '')
                    text = text + "<td>&nbsp;</td>";
                else
                    text = text + "<td align=\"center\">"+mode.strength[j]+"</td>";
            }
            text = text + "</tr>";
        }
    }
    text = text+"</table>";
    return text;
}
function print_ammo(listV) {
    var text="";
    for (var key in listV) {
        var v = vehicles[key];
        if ( v.ammo ) {
            text = text + "<div class='p_section'>";
            text = text + "<h4 class='p_h4_ammo'>" + v.name +"</h4>";
            for (var i=0; i<listV[key]; i++)
                text = text + "<div class='p_entry'><span class='p_ammo_name'>ID:</span><span class='p_ammo_number'>H:</span><span class='p_ammo_number'>A:</span></div>";
            //    text = text + "<div><h4 class='p_h4'>" + v.name +"</h4><p class='p_h4 right'>"+$(entry).find('#cost').text() + "/" + $(entry).find('#br').text() + "</p></div>";
            text = text + "</div>";
        }
    }


    return text;
}
function print_vehicles(listV, listW) {
    var text="";
    var first = true;
    text = text + "<div class='p_section'>";
    for (var key in listV) {
        var v = vehicles[key];
        if (first) {
            first=false;
            text = text + "<table style='border:1px;'><tr><th></th><th>Move</th><th>Armour</th><th>Weapon</th><th>Special</th></tr>";
        }
        text = text +"<tr><td>"+v.name+"</td><td style='white-space:pre;'>";
        if (v.move)
            text = text+v.move[0]+"   /   "+v.move[1]+"</td><td style='white-space:pre;'>";
        else
            text = text+"    /    </td><td style='white-space:pre;'>";
        if (v.armour) {
            if (v.armour === true)
                text = text + "    /    /    </td><td>";
            else
                text = text +v.armour[0]+" / " + v.armour[1]+" / "+v.armour[2]+"</td><td>";
        }
        else {
            if (v.hits === true)
                text = text + "    hit(s)";
            else {
                text = text + v.hits;
                if ( v.hits <= 1 )
                    text = text + " hit";
                else
                    text = text + " hits";
            }
            text = text + "</td><td>";
        }

        if (v.weapons){
            for (var k=0; k<v.weapons.length; k++) {
                if ( k>0 )
                    text = text +", ";
                text = text + weapons[v.weapons[k]].name;
                if ( v.ammo && v.ammo !== true ) {
                    text = text + " (" + v.ammo[k]+")";
                }
                listW[v.weapons[k]]=1;
            }
            text = text +"</td><td>";
        } else {
            text = text + "&nbsp;</td><td>";
        }
        var special = "";
        if (v.open)
            special = "Open-Topped";
        if (v.special) {
            if (v.open)
                special = special + ", ";
            special = special + v.special;
        }
        text = text + special + "</td></tr>";
    }
    if (!first)
        text = text + "</table>";
    text = text + "</div>";
    text = text + "<div class='p_section'>"+ print_weapons(listW) + "</div>";
    
    //text = text + "<div class='p_section' id='p_ammo'>"+ print_ammo(listV) + "</div>";
    text = text + print_ammo(listV);
    return text;
}
function print_help() {
    var dialog = $('<div><span>Click on roster text to return to edit screen.</span></div>').appendTo($('#p_div'));
    dialog.dialog({title:'Help', modal:true, resizable:false, closeOnEscape:true });
    dialog.delay(1750).fadeOut(function(){ $(this).remove(); });
}
function print_render(){
    var force = force_by_id($('#main').data('bg_id'));
    listVehicles = {};
    listWeapons = {};
    var sort = null;
    if ( false ) // if set to true will layout largest section first.
        sort = 'height';
    $('body').append($('<div id="p_div" class="p_div clearfix"></div>').html(print_header(force)));
    $('#p_div').append($('<div id="p_div_inner" class="p_div clearfix"></div>').html(print_sections()+print_vehicles(listVehicles,listWeapons)));

    $('#p_div_inner').isotope({
        itemSelector:'.p_section',
        layoutMode:'masonry',
        getSortData : {
            height : function( $elem ) {
                return -1*$elem.height();
            }
        },
        sortBy:sort
    });
    $('#p_ammo').isotope({itemSelector:'.p_parent'});
    $('#main').hide();
    print_help();
}
function merge_vehicles(){
    for (var i=0; i<vehicles_private.length; i++) {
        if (vehicles_private[i].move)
            vehicles[i].move=vehicles_private[i].move;
        if (vehicles_private[i].armour)
            vehicles[i].armour=vehicles_private[i].armour;
        if (vehicles_private[i].ammo)
            vehicles[i].ammo=vehicles_private[i].ammo;
        if (vehicles_private[i].mg)
            vehicles[i].mg=vehicles_private[i].mg;
        if (vehicles_private[i].hits)
            vehicles[i].hits=vehicles_private[i].hits;
    }
}
function merge_weapons(){
    for (var key in weapons) {
        if ( weapons_private[key] === undefined )
            console.log('No weapons_private entry for ' + key);
        else if (weapons_private[key].stats)
            weapons[key].stats = weapons_private[key].stats;
    }
}
function SortByName(a, b){
    var aGroup = a.group.toLowerCase();
    var bGroup = b.group.toLowerCase();
    if ( aGroup < bGroup )
        return(-1);
    if ( aGroup > bGroup )
        return(1);
    var aName = a.name.toLowerCase();
    var bName = b.name.toLowerCase(); 
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function test_forces() {
    for (var i=0; i<forces.length; i++){
        for (var j=0; j<forces[i].sections.length; j++) {
            for (var k=0; k<forces[i].sections[j].entries.length; k++) {
                var entry = forces[i].sections[j].entries[k];
                var print = false;
                if ( entry.v === 0 ){
                    print = true;
                }
                if ( typeof entry.options != 'undefined' ) {
                    for (var l=0; l<entry.options.length; l++) {
                        for (var m=0; m<entry.options[l].choices.length; m++) {
                            if (entry.options[l].choices[m].w === 0)
                                print = true;
                            if (entry.options[l].choices[m].v === 0)
                                print = true;
                        }
                    }
                }
                if ( print === true ){
                    console.log(forces[i].name);
                    console.log(forces[i].sections[j].name);
                    console.log("Error: " +forces[i].sections[j].entries[k].name);
                }
            }
        }
    }
}

var merged = false;
function merge() {
    if (merged)
        return;
    if ( typeof vehicles_private !== 'undefined' )
        merge_vehicles();
    if ( typeof weapons_private !== 'undefined' )
        merge_weapons();
    merged = true;
}

var debug = false;
$( document ).ready( function() {
    forces.sort(SortByName);
    if ( debug ) {
        test_forces();
        return;
    }
    // Have to put the option_change handler here before render
    // as render may trigger a load, which will depend on this
    // option handler to correctly calculate values.
    $('body').on('change', '.opt_select', option_change);
    render();
    update_selectable();
    sub_button_bind();
    update_accordion();
    $('.save_button').button();
    $('body').on('click','#p_div', function () {
        $('#main').show(); $('#p_div').remove();});
    $('body').on('click', '#save', save);
    $('body').on('click', '#load', loadDialog);
    $('body').on('click', '#print', print_render);
    $('body').on('change', '#forceChoice', changeForce);
    merge();
});
