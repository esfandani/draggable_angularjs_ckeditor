function uuid() {
    function _r8(s) {
        var r = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? r.substr(0,4) + r.substr(4,4) : r ;
    }
    return 'e'+_r8() + _r8(true) + _r8(true) + _r8();
}

function append_jQlite_dom(elm,app_elm,order){
    
    if(order!==undefined){
        app_elm.attr('order',order);
       // app_elm.attr('drop','newSection('+order+')');
        app_elm.attr('drop','newSection');
    }
    elm.append(app_elm);
}
function _hasClass(el,className){
    var elClass = ' '+el.className+' ';
    return (elClass.indexOf(' '+className+' ') != -1); 
}
function __addClass(el, className){
    if(!_hasClass(el,className)){
        el.className += (' '+className);       
    }
    
}


function __removeClass(el,className){
    var elClass = ' '+el.className+' ';
    while(elClass.indexOf(' '+className+' ') != -1)
         elClass = elClass.replace(' '+className+' ', '');
    el.className = elClass;
}
function __addDeleteBulkClass(selector, className,isDelete){
    angular.forEach(angular.element(document.querySelectorAll(selector)), function(el, key){ 
            if(isDelete){
                __removeClass(el,className);
            }else{
                 __addClass(el,className);
            }
    });
}

/**
* myApp Module
*
* Description
*/
var myApp = angular.module('myApp', []);

myApp.directive('ckeditor', function($compile){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        restrict: 'C',
        link: function(scope,elm, attrs, controller) {
                      var ck = CKEDITOR;
            var inlines = [];
            function removeElementBySelector(selector){
                angular.forEach(angular.element(document.querySelectorAll(selector)), function(value, key){ 
                    var a = angular.element(value);
                    a.remove();
                });
            }
            var templates_fun = function(){
                return scope.template;
            };

            scope.$watch(templates_fun, function(template) {

                var add_editor = function(id){
                    var inline = ck.inline(id, {
                        extraPlugins: 'sharedspace',
                        removePlugins: 'floatingspace,resize',
                       
                        sharedSpaces: {
                            top: 'top',
                            bottom: 'bottom'
                        }
                    });
                   return inline;
                };



                var default_editor = "default_editor";
                if(ck.instances[default_editor]===undefined){
                    append_jQlite_dom(elm, angular.element('<div contenteditable=false  id='+default_editor+'></div>'));
                      // append_jQlite_dom(elm, angular.element('<div contenteditable="false" class="cke_editable_inline" id="default_editor"></div>'));
                       var inlne = add_editor(default_editor);
                      //inline.focuse();
                       ck.instances[default_editor].setData("<span></span>");
                }else{

                    ck.instances[default_editor].focus();
                }
                for(var ins in ck.instances){
                    if((typeof(ins) !='undefined' ) && ck.instances[ins].name!=default_editor){
                        //console.log(ck.instances[ins].getData());
                        ck.instances[ins].setData();
                        ck.instances[ins].destroy(true);
                    }
            }

                removeElementBySelector('.marker');
                removeElementBySelector('.dragsink');
                var order = 0;
                var htmlSinkDom = '<div dragsink class="dragsink" ></div>';
                var app_elm = angular.element(htmlSinkDom);
                append_jQlite_dom(elm,app_elm,order);
                $compile(app_elm)(scope);
                order++;

                angular.forEach(template.sections, function(section) {
                     append_jQlite_dom(elm, angular.element('<div contenteditable='+section.edit+' class="marker" id='+section.id+'></div>'));
                     var app_elm = angular.element(htmlSinkDom);
                     append_jQlite_dom(elm,app_elm,order);
                     $compile(app_elm)(scope);
                     order++;
                     var inline_editor = add_editor(section.id);
                     ck.instances[section.id].setData(section.dup_data);
                     inline_editor.on('change',function(){
                        section.dup_data = inline_editor.getData();
                     })
                     /*var pos = inlines.map(function(e) { return e.name; }).indexOf(inline_editor.name);
                     if(pos < 0){
                        inlines.push(inline_editor);
                    }*/
                });
            
            },true);
           
        }
    };
});


myApp.directive('dragsource', [ function(){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function(scope, element, attrs, controller) {
            var el = element[0];
            el.draggable = true;
            
            el.addEventListener(
                'dragstart',
                function(e) {
                    console.log('drag start');
                    e.dataTransfer.effectAllowed = 'move';
                    var source = el.getAttribute('dragsource');
                    var data = source+'$$$';
                    if(source == 'img'){
                        data+=angular.element(this).children().eq(0).attr('src');
                    }
                    e.dataTransfer.setData('text',data);
                    __addClass(el,'drag');
                    __addDeleteBulkClass('.dragsink','dragsinkk');
                    return false;
                },
                false
                );
           
           el.addEventListener(
                'dragend',
                function(e) {
                    if (e.preventDefault) e.preventDefault();
                    console.log('drag end');
                    __removeClass(el,'drag');
                    __addDeleteBulkClass('.dragsink','dragsinkk',true);
                    return false;
                },
                false
            );
         

        }
    };
}]);


myApp.directive('dragsink', function() {
    return {
        scope: {
            drop:"&",
        },
        link: function(scope, element) {
            var el = element[0];
            el.addEventListener(   
                'dragover', 
                function(e) {
                    console.log('dragover');
                    e.dataTransfer.dropEffect = 'move';
                    if (e.preventDefault) e.preventDefault();
                    __addClass(el,'over');
                    return false;
                },
                false
            );
            el.addEventListener(
                'dragenter',
                function(e) {
                    console.log('dragenter');
                    __addClass(el,'over');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragleave',
                function(e) {
                    console.log('leave');
                    __removeClass(el,'over');
                    return false;
                },
                false
            );
            el.addEventListener(
                'drop',
                function(e) {
                    console.log('drop');
                     if (e.preventDefault) e.preventDefault();
                    if (e.stopPropagation) e.stopPropagation();
                    
                    var source = e.dataTransfer.getData("text");
                    console.log(source);
                    __removeClass(el,'over');
                    var orderId = el.getAttribute('order');
                    var func = scope.drop();
                    if(typeof func !== 'undefined'){
                        func(source,orderId);
                    }

                 return false;
             },
             false
            );
           
        }
    };
});



var myCtrl = function ($scope) {
    templates = [{'id':uuid(),'sections': [
    {'id':uuid(),'edit':'true','data':'<h3>Editable section<h3'},
    {'id':uuid(),'edit':'false','data':'<h3>NonEditable section<h3>'},
    ]},{'id':uuid(),'sections': [
    {'id':uuid(),'edit':'true','data':'<h3>Second template Editable section<h3>'},
    {'id':uuid(),'edit':'false','data':'<h3>Second template NonEditable section<h3>'},
    ]}];

    for(var i =0;i<templates.length;i++){
        var sections = templates[i].sections;
        for(var j =0;j<sections.length;j++){
            var section = sections[j];
            section.dup_data = section.data;
        }
    }
    $scope.template = templates[0];
    $scope.drag = false;


    $scope.setTemplate = function(num) {
        $scope.template = templates[num];
    };
    
    $scope.createSection = function(pos){
        var id = uuid();
        var section = {'id':id,'edit':'true','data':'<h3>'+id+'</h3>'};
        section.dup_data = section.data;
        if(pos >= 0 && pos < $scope.template.sections.length ){
            $scope.template.sections.splice(pos, 0, section);
        }
    };
    $scope.newSection = function(source, pos){
        var id = uuid();
        var split = source.split('$$$');
        var section;
        if(split[0]=='section'){
            section = {'id':id,'edit':'true','data':'new Editable section with id:'+id};
        }else if(split[0]=='img'){
            section = {'id':id,'edit':'true','data':'<img src="'+split[1]+'" style="width:100%;"></img>'};
        }
         section.dup_data = section.data;
        // var section = {'id':id,'edit':'true','data':'<img src="https://www.google.com/images/srpr/logo11w.png" style="width:100%;height:100px;">'};
        if(pos >= 0 && pos <= $scope.template.sections.length ){
            $scope.template.sections.splice(pos, 0, section);
            $scope.$apply();
        }  

    };
   

    
    
};