	var gojs_shapes=["Rectangle","Square","Ellipse","Circle","Connector","TriangleRight","TriangleDown","TriangleLeft","TriangleUp","Line1","Line2","MinusLine","LineH","LineV","BarH","BarV","Curve1","Curve2","Curve3","Curve4","Alternative","Merge","Triangle","Decision","Diamond","Pentagon","DataTransmission","Hexagon","Heptagon","Octagon","Nonagon","Decagon","Dodecagon","FivePointedStar","SixPointedStar","SevenPointedStar","EightPointedStar","NinePointedStar","TenPointedStar","FivePointedBurst","SixPointedBurst","SevenPointedBurst","EightPointedBurst","NinePointedBurst","TenPointedBurst","Cloud","Gate","Crescent","FramedRectangle","Delay","HalfEllipse","Heart","Spade","Club","Ring","YinYang","Peace","NotAllowed","Fragile","HourGlass","Lightning","Parallelogram1","Input","Output","Parallelogram2","ThickCross","ThickX","ThinCross","ThinX","RightTriangle","RoundedIBeam","RoundedRectangle","CommElement","Border","SquareIBeam","Trapezoid","Ladder","ManualLoop","ManualOperation","GenderMale","GenderFemale","PlusLine","XLine","AsteriskLine","CircleLine","Pie","PiePiece","StopSign","LogicImplies","LogicIff","LogicNot","LogicAnd","LogicOr","LogicXor","LogicTruth","LogicFalsity","LogicThereExists","LogicForAll","LogicIsDefinedAs","LogicIntersect","LogicUnion","Arrow","ISOProcess","Chevron","DoubleArrow","DoubleEndArrow","IBeamArrow","Pointer","RoundedPointer","SplitEndArrow","MessageToUser","SquareArrow","Cone1","Cone2","Cube1","Cube2","MagneticData","Cylinder1","Cylinder2","Cylinder3","DirectData","Cylinder4","Prism1","Prism2","Pyramid1","Pyramid2","Actor","Card","Collate","CreateRequest","Database","StoredData","DataStorage","DiskStorage","Display","DividedEvent","DividedProcess","Document","ExternalOrganization","ExternalProcess","File","Interrupt","InternalStorage","Junction","LinedDocument","LoopLimit","SequentialData","MagneticTape","ManualInput","MessageFromUser","MicroformProcessing","MicroformRecording","MultiDocument","MultiProcess","OfflineStorage","OffPageConnector","Or","PaperTape","PrimitiveFromCall","PrimitiveToCall","Subroutine","Procedure","Process","Sort","Start","Terminator","TransmittalTape","AndGate","Buffer","Clock","Ground","Inverter","NandGate","NorGate","OrGate","XnorGate","XorGate","Capacitor","Resistor","Inductor","ACvoltageSource","DCvoltageSource","Diode","Wifi","Email","Ethernet","Power","Fallout","IrritationHazard","ElectricalHazard","FireHazard","BpmnActivityLoop","BpmnActivityParallel","BpmnActivitySequential","BpmnActivityAdHoc","BpmnActivityCompensation","BpmnTaskMessage","BpmnTaskScript","BpmnTaskUser","BpmnEventConditional","BpmnEventError","BpmnEventEscalation","BpmnEventTimer"];
	
	function init_shapelist(){
		$.each(gojs_shapes,function(i,ishp){
			$("#myshapes ul").append('<li data=\'"category":"'+ishp+'"\'>'+ishp+'</li>');
		});
	}
	
	
	function load_shape(shapename){
	    var $$ = go.GraphObject.make;  // for conciseness in defining templates
	    // define 定义属性 some common property settings
        var nodeStyle=function () {
			return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
					new go.Binding("isShadowed", "isSelected").ofObject(),
					{
					  selectionAdorned: false,
					  shadowOffset: new go.Point(0, 0),
					  shadowBlur: 15,
					  shadowColor: "blue",
					  toolTip: sharedToolTip
					}
				];
		}
	  
	    //提示框
	    var sharedToolTip =$$(go.Adornment, "Auto",$$(go.Shape, "RoundedRectangle", { fill: "lightyellow" }), $$(go.TextBlock, { margin: 2  },new go.Binding("text",  "" , function(d) { return d.category; })));
			
	    // 形状的style 
        var shapeStyle= function () {
			return {
			  name: "NODESHAPE",
			  fill: "#ccc",
			  stroke: "#aaa",
			  desiredSize: new go.Size(30, 30),
			  strokeWidth: 1
			};
		}

	    //端口的style
        var portStyle=function(input) {
			//var margin=new go.Margin(1, -100, 0, 0);
			//if(input)margin=new go.Margin(1, 0, 0, 1);
			return {
			  desiredSize: new go.Size(3, 6),
			  //margin: new go.Margin(1, -1, 0, 0),
			  fill: "#666",stroke: null,
			  fromSpot: go.Spot.Right,
			  fromLinkable: !input,
			  toSpot: go.Spot.Left,
			  toLinkable: input,
			  toMaxLinks: 1,
			  fromMaxLinks:1,
			  cursor: "pointer"
			};
		}
	  
		
	    //与门
		var myTemplate =
			$$(go.Node, "Spot", nodeStyle(),
				$$(go.Shape, shapename, shapeStyle())
				//,$$(go.Shape, "Ladder", portStyle(true),{ portId: "in1", alignment: new go.Spot(-0.05, 0.3),fill:"#666" })
				//,$$(go.Shape, "Ladder", portStyle(true),{ portId: "out", alignment: new go.Spot(-0.05, 0.7),fill:"#666" })
				,$$(go.Shape, "Ladder", portStyle(false),{ portId: "in", alignment: new go.Spot(-0.05, 0.5) })//
				,$$(go.Shape, "Ladder", portStyle(false),{ portId: "out", alignment: new go.Spot(1.05, 0.5) })
				//,{ portId: "out", alignment: new go.Spot(1, 0.5) }),
				//$$(go.TextBlock, { margin: 2  },new go.Binding("text",  "" , function(d) { return d.category; }))
			);
		
		myDiagram.nodeTemplateMap.add(shapename, myTemplate);
	
	}



	function load_template_mathlogic(){
	  
	  var $$ = go.GraphObject.make;  // for conciseness in defining templates
	  
	  // define 定义属性 some common property settings
      function nodeStyle() {
        return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                new go.Binding("isShadowed", "isSelected").ofObject(),
                {
                  selectionAdorned: false,
                  shadowOffset: new go.Point(0, 0),
                  shadowBlur: 15,
                  shadowColor: "blue",
                  toolTip: sharedToolTip
                }
			];
      }
	  
	  //提示框
	  var sharedToolTip =
        $$(go.Adornment, "Auto",
          $$(go.Shape, "RoundedRectangle", { fill: "lightyellow" }),
          $$(go.TextBlock, { margin: 2  },
            new go.Binding("text",  "" , function(d) { return d.category; })));
			
	  // 形状的style 
      function shapeStyle() {
        return {
          name: "NODESHAPE",
          fill: "#ccc",
          stroke: "#aaa",
          desiredSize: new go.Size(30, 30),
          strokeWidth: 1
        };
      }

	  //端口的style
      function portStyle(input) {
		//var margin=new go.Margin(1, -100, 0, 0);
		//if(input)margin=new go.Margin(1, 0, 0, 1);
        return {
          desiredSize: new go.Size(3, 6),
		  //margin: new go.Margin(1, -1, 0, 0),
          fill: "#666",stroke: null,
          fromSpot: go.Spot.Right,
          fromLinkable: !input,
          toSpot: go.Spot.Left,
          toLinkable: input,
          toMaxLinks: 1,
		  fromMaxLinks:1,
          cursor: "pointer"
        };
      }
	  
	  // 每个节点的模板define templates for each type of node
      var inputTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "Circle", shapeStyle(),
            { fill: red }),  // override the default fill (from shapeStyle()) to be red
          $$(go.Shape, "Rectangle", portStyle(false),  // the only port
            { portId: "", alignment: new go.Spot(1, 0.5) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function (e, obj) {
                e.diagram.startTransaction("Toggle Input");
                var shp = obj.findObject("NODESHAPE");
                shp.fill = (shp.fill === green) ? red : green;
                updateStates();
                e.diagram.commitTransaction("Toggle Input");
              }
          }
        );

	  //输出模板 	
      var outputTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "Rectangle", shapeStyle(),
            { fill: green }),  // override the default fill (from shapeStyle()) to be green
          $$(go.Shape, "Rectangle", portStyle(true),  // the only port
            { portId: "", alignment: new go.Spot(0, 0.5) })
        );

	  //与门
      var mathlogic_andTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "AndGate", shapeStyle()),
          $$(go.Shape, "Ladder", portStyle(true),
            { portId: "in1", alignment: new go.Spot(-0.05, 0.3),fill:"#666" }),
          $$(go.Shape, "Ladder", portStyle(true),
            { portId: "in2", alignment: new go.Spot(-0.05, 0.7),fill:"#666" }),
          $$(go.Shape, "Ladder", portStyle(false),{ portId: "out", alignment: new go.Spot(1.05, 0.5) }),
            //{ portId: "out", alignment: new go.Spot(1, 0.5) }),
		  $$(go.TextBlock, { margin: 2  },new go.Binding("text",  "" , function(d) { return d.category; }))
        );
		
	  //或门
      var mathlogic_orTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "OrGate", shapeStyle()),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in1", alignment: new go.Spot(0.16, 0.3) }),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in2", alignment: new go.Spot(0.16, 0.7) }),
          $$(go.Shape, "Rectangle", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5) })
        );

      var mathlogic_xorTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "XorGate", shapeStyle()),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in1", alignment: new go.Spot(0.26, 0.3) }),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in2", alignment: new go.Spot(0.26, 0.7) }),
          $$(go.Shape, "Rectangle", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5) })
        );

      var mathlogic_norTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "NorGate", shapeStyle()),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in1", alignment: new go.Spot(0.16, 0.3) }),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in2", alignment: new go.Spot(0.16, 0.7) }),
          $$(go.Shape, "Rectangle", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5) })
        );

      var mathlogic_xnorTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "XnorGate", shapeStyle()),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in1", alignment: new go.Spot(0.26, 0.3) }),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in2", alignment: new go.Spot(0.26, 0.7) }),
          $$(go.Shape, "Rectangle", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5) })
        );

      var mathlogic_nandTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "NandGate", shapeStyle()),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in1", alignment: new go.Spot(0, 0.3) }),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in2", alignment: new go.Spot(0, 0.7) }),
          $$(go.Shape, "Rectangle", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5) })
        );

      var mathlogic_notTemplate =
        $$(go.Node, "Spot", nodeStyle(),
          $$(go.Shape, "Inverter", shapeStyle()),
          $$(go.Shape, "Rectangle", portStyle(true),
            { portId: "in", alignment: new go.Spot(0, 0.5) }),
          $$(go.Shape, "Rectangle", portStyle(false),
            { portId: "out", alignment: new go.Spot(1, 0.5) })
        );

      // add the templates created above to myDiagram and palette
      myDiagram.nodeTemplateMap.add("input", inputTemplate);
      myDiagram.nodeTemplateMap.add("output", outputTemplate);
      myDiagram.nodeTemplateMap.add("and", mathlogic_andTemplate);
      myDiagram.nodeTemplateMap.add("or", mathlogic_orTemplate);
      myDiagram.nodeTemplateMap.add("xor", mathlogic_xorTemplate);
      myDiagram.nodeTemplateMap.add("not", mathlogic_notTemplate);
      myDiagram.nodeTemplateMap.add("nand", mathlogic_nandTemplate);
      myDiagram.nodeTemplateMap.add("nor", mathlogic_norTemplate);
      myDiagram.nodeTemplateMap.add("xnor", mathlogic_xnorTemplate);
	  
    }

 
