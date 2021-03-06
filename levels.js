/* This is where the levels are stored (and loaded in one big chunk :/) to be displayed by game.js
 * It's actually JSON but I don't want to bother calling it something else.
 * The format is a little (read: VERY) wonky. So here's a quick guide.
 * It is a file with exclusively ONE variable: levels
 * 	levels is an array of all the levels, which are objects. Each level contains: ...
 *	 	lines
 * 		answer
 * 		player
 * 		par
 * 	(If one of these are missing it will be taken from the previous level (normally. Not be design))
 * 	... and may optionally contain:
 * 		obstacles
 * 		help
 * 	lines is an array of lines. A line is an array of four numbers: x, y, width, height
 * 		The line is rendered from (x, y) to (x+width, y+height)
 * 	answer is a matrix in the form "a,b,c,d,e,f"
 * 		Where a-f are defined as:
 * 			a b c
 * 			d e f
 * 			0 0 1
 * 		(I THINK. TODO: Make sure this is right)
 * 		It can be obtained by playing a created level and pressing B when player is in desired location
 * 		The matrix will be spit out and can be pasted in.
 * 		Because the output can be long, the next attribute is usually written as `, [attrname]` rather than after answer
 * 	player is an array [x, y] which is where the player starts. Answer is transformed from here as well
 * 	par is displayed as "TARGET: [par]". It is the least amount of moves the level can take
 * 	obstacles is a list of matrices (SEE ANSWER) that will be displayed red to not be landed on
 * 	help is an object describing the grey help text that accompanies most levels
 * 		It consists of (all optional):
 * 			lines
 * 			curves
 * 			text
 * 		lines is like the lines within levels (SEE LINES within levels) but with a dotted line and an arrowhead
 * 			Each line has an optional fifth element that if true, an arrowhead will not be displayed
 * 		curves is complicated af. It is an array of partial circles displayed like lines used to indicate angles
 * 			Each curve is [centerx, centery, slopeStart, startPos, slopeEnd, endPos, direction]
 * 			(centerx, centery) is the center of the circl the partial arc is made from. Usually the intersection of two lines
 * 			slopeStart is the slope of the line on which the curve starts (rather than an angle, for convenience)
 * 			startPos is "+" if the start is to the right of the center, or "-" if the start is to the left
 * 				If it is neither, it is "+" if it is below (+y), or "-" if it is above (-y)
 *			slopeEnd, endPos are the same as the start counterparts, but for the end of the curve
 *			direction is "cw" if the curve travels clockwise and "ccw" otherwise.
 *				THE ANGLE IS CURRENTLY ASSUMED TO BE <180degrees, therefore direction flips the circle rather than the curvature
 *		text is [x, y, string] where string is the text to be displayed and x,y is the position of the top left corner
 * That's it, it's actually a surprisingly appropriate format if you think about the way the levels are designed.
 * TODO:
 * 	Make a level designer
 * 	Minify this file
 * 	Figure out a way to find levels by number
 */

var levels = [
	{
		// 1-V
		lines :
		[
			[50, 0, 0, 100]
		],
		answer :
			"-1,0,0,1,100,0"
		, player :
			[10, 46],
		par: 1,
		help:
		{
			text: [[10, 12, "Click the line to reflect"]]
		}
	},
	{
		// 1-V
		lines :
		[
			[30, 0, 0, 100],
			[50, 0, 0, 100]
		],
		answer :
			"-1,0,0,1,100,0"
		, player :
			[10, 46],
		par: 1,
		obstacles :
		[
			"-1,0,0,1,60,0"
		],
		help:
		{
			text: [[10, 12, "Don't land on red"]]
		}
	},
	{
		// 2-V
		// Translated
		lines :
		[
			[50, 0, 0, 100],
			[90, 0, 0, 100]
		],
		answer :
			"1,0,0,1,80,0"
		, player :
			[10, 46],
		par: 2,
		help:
		{
			text: [[4, 12, "Two parallel reflections makes a translation\nIt's not a law of Flip, it's a law of the universe"]],
			lines: [[50, 60, 40, 0], [10, 50, 40, 0], [50, 50, 40, 0]]
		}
	},
	{
		// 2-V
		// Dialated
		lines :
		[
			[50, 0, 0, 100],
			[70, 0, 0, 100]
		],
		answer :
			"1,0,0,1,80,0"
		, player :
			[10, 46],
		par: 4,
		help:
		{
			text: [[10, 12, "You move twice the distance between the lines,\nno matter where the lines are"], [22, 50, "... = 4 boxes"], [52, 60, "2 boxes..."]],
			lines: [[50, 60, 20, 0], [10, 50, 40, 0], [50, 50, 40, 0]]
		}
	},
	{
		// 2-V
		// Dialated
		lines :
		[
			[40, 0, 0, 100],
			[50, 0, 0, 100],
			[65, 0, 0, 100],
			[73, 0, 0, 100],
		],
		answer :
			"1,0,0,1,36,0"
		, player :
			[10, 46],
		par: 4,
		help:
		{
			text: [[6, 12, "So picking the right lines to pair up is important"], [40.5, 60, "Pair\n1"], [65.5, 60, "Pair\n2"]],
			lines: [[40, 60, 10, 0, true], [65, 60, 8, 0, true], [10, 70, 20, 0], [30, 70, 16, 0]]
		}
	},
	{
		// 3-V
		// Have to go backwards
		lines :
		[
			[20, 0, 0, 100],
			[60, 0, 0, 100],
			[68, 0, 0, 100]
		],
		answer :
			"1,0,0,1,64,0"
		, player :
			[10, 46],
		par: 4,
		help:
		{
			text: [[10, 12, "The order you reflect dictates the direction\nSometimes you have to go backwards (Donald Trump)"], [10, 80, "1"], [80, 70, "2"]],
			lines: [[68, 60, -8, 0], [90, 70, -16, 0], [10, 80, 80, 0]]
		}
	},
	{
		// 2-V-2-H
		// Two translations in each direction
		lines :
		[
			[0, 60, 100, 0],
			[0, 70, 100, 0],
			[40, 0, 0, 100],
			[50, 0, 0, 100]
		],
		answer :
			"1,0,0,1,40,-20"
		, player :
			[10, 46],
		par: 6,
		help: {text: [[10, 12, "Don't worry! They're still parallel"]]}
	},
	{
		// 2-D
		// Translation with diagonal lines
		lines :
		[
			[10, 0, 30, 100],
			[50, 0, 30, 100]
		],
		answer :
			"1,0,0,1,73.39449310302734,-22.018348693847656"
		, player :
			[10, 46],
		par: 2,
		help: {text: [[10, 12, "Still parallel. All the same rules apply"]]}
	},
	{
		// 4-D
		// Two translation with diagonal lines; paired
		lines :
		[
			[10, 0, 30, 100],
			[30, 0, 30, 100],
			[80, 0, -20, 100],
			[90, 0, -20, 100]
		],
		answer :
			"1,0,0,1,55.92800521850586,-7.163026809692383"
		, player :
			[10, 46],
		par: 4,
		obstacles :
		[
			"-0.8348624110221863,0.5504587292671204,0.5504587292671204,0.8348624110221863,55.04587173461914,-16.513761520385742"
		],
		help:
		{
			text: [[10, 12, "Stay right-side up!\nStick to reflecting parallel line pairs."]]
		}
	},
	{
		// 4-D
		// Two translation with diagonal lines
		lines :
		[
			[20, 0, 30, 100],
			[40, 0, 30, 100],
			[50, 0, -20, 100],
			[60, 0, -20, 100]
		],
		answer :
			"1,0,0,1,75.15877532958984,-3.3168673515319824"
		, player :
			[10, 46],
		par: 6,
		obstacles :
		[
			"0.5589273112208892,0.8292166549047282,-0.8292166549047284,0.5589273112208893,66.5137614678899,-5.0458715596330315"
			, "0.5589273112208892,0.8292166549047282,-0.8292166549047284,0.5589273112208893,85.74453069865913,-1.1997177134791848"
			, "0.5589273112208892,-0.8292166549047283,0.8292166549047283,0.5589273112208895,-32.99223712067747,57.9745942131263"
			, "0.5589273112208892,0.8292166549047282,-0.8292166549047284,0.5589273112208893,56.104446012702894,-25.476358503881446"
		],
		help:
		{
			text: [[10, 22, "Parallel!"]]
		}
	},
	{
		// 3-V
		// New level, reflection at the last
		lines :
		[
			[30, 0, 0, 100],
			[50, 0, 0, 100],
			[62, 0, 0, 100]
		],
		answer :
			"1,0,0,1,16,0"
		, player :
			[10, 46],
		par: 4,
		help: {text: [[10, 12, "How will you pair them?"]]}
	},
	{
		// 3-V
		// Reflection
		lines :
		[
			[40, 0, 0, 100],
			[60, 0, 0, 100],
			[54, 0, 0, 100]
		],
		answer:
			"-1,0,0,1,68,0"
		, player:
			[10, 46],
		par: 3,
		help:
		{
			text: [[10, 12, "That R is backwards!\nYou're going to need an odd number of flips"]]
		}
	},
	{
		// 3-V
		// Have to reflect on the way through a translation
		lines :
		[
			[27, 0, 0, 100],
			[45, 0, 0, 100],
			[55, 0, 0, 100]
		],
		answer :
			"-1,0,0,1,94,0"
		, player :
			[10, 46],
		par: 5,
		obstacles :
		[
			"1,0,0,1,56,0"
		],
		help:
		{
			text: [[6, 12, "A difficult level before we start something new"]]
		}
	},
	{
		// 2-D
		// Two diagonals makes a rotation
		lines :
		[
			[40, 0, 20, 100],
			[60, 0, -20, 100]
		],
		answer :
			"0.7041420118343197,0.7100591715976332,-0.7100591715976331,0.7041420118343197,50.29585798816568,-20.71005917159764"
		, player :
			[10, 46],
		par: 2,
		obstacles :
		[
			"0.7041420118343197,-0.7100591715976332,0.7100591715976331,0.7041420118343197,-20.71005917159765,50.29585798816568"
		],
		help:
		{
			curves: [
				[50, 50, 5/1, "-", -5/1, "+", "cw"],
				[50, 50, 0, "-", 1, "-", "cw"]
			],
			lines: [[50, 50, -50, 0, true], [50, 50, -50, -50, true], [50, 50, -10, -50, true], [50, 50, 10, -50, true]],
			text: [[7, 12, "Two flips on two lines that INTERSECT makes a rotation\nSound familiar?"]]
		}
	},
	{
		// 2-D
		// Repeated
		lines :
		[
			[40, 0, 20, 100],
			[60, 0, -20, 100]
		],
		answer :
			"-0.008368054339833897,0.9999649872203358,-0.9999649872203355,-0.008368054339833841,100.41665207800848,0.42015335597492864"
		, player :
			[10, 46],
		par: 4,
		help:
		{
			text: [[5, 16, "Like translations,\nthe angle rotated is twice the angle between the two lines"]],
			curves: [
				[50, 50, 5/1, "-", -5/1, "+", "cw"],
				[50, 50, 0, "-", 1, "-", "cw", 15],
				[50, 50, 1, "-", null, "-", "cw", 15]
			],
			lines: [[50, 50, -50, 0, true], [50, 50, 0, -50, true], [50, 50, -10, -50, true], [50, 50, -50, -50, true], [50, 50, 10, -50, true]],
		}
	},
	{
		// 2-D
		// Two diagonals makes a rotation
		lines :
		[
			[40, 0, 20, 100],
			[60, 0, -20, 100]
		],
		answer :
			"0.7041420118343197,-0.7100591715976332,0.7100591715976331,0.7041420118343197,-20.71005917159765,50.29585798816568"
		, player :
			[10, 46],
		par: 2,
		obstacles :
		[
			"0.7041420118343197,0.7100591715976332,-0.7100591715976331,0.7041420118343197,50.29585798816568,-20.71005917159764"
		],
		help:
		{
			curves: [
				[50, 50, -5/1, "-", 5/1, "+", "ccw"],
				[50, 50, 0, "-", -1, "-", "ccw"]
			],
			lines: [[50, 50, -50, 0, true], [50, 50, -50, 50, true], [50, 50, -10, 50, true], [50, 50, 10, 50, true]],
			text: [[7, 12, "And once again, the order dictates the direction"]]
		}
	},
	{
		// 4-D
		// Rotate around two non-parallel crosses
		lines :
		[
			[20, 0,  20, 100],
			[35, 0, -30, 100],
			[45, 0,  40, 100],
			[55, 0, -15, 100]
		],
		answer :
			"-0.44904929399490356,-0.8935070037841797,0.8935070037841797,-0.44904929399490356,34.57380676269531,83.57813262939453"
		, player :
			[10, 46],
		par: 4,
		obstacles :
		[
			"0.9596240550907337,-0.281285749534555,0.2812857495345551,0.9596240550907337,40.532962472802296,15.712971893856121"
			, "0.22492881999367287,-0.9743751977222397,0.9743751977222399,0.2249288199936728,44.368870610566276,27.206580196140464"
			, "0.7696069211961632,0.6385179612563475,-0.6385179612563475,0.7696069211961631,73.06751927778822,-2.5014105698702273"
			, "0.9336870026525199,-0.35809018567639267,0.35809018567639267,0.9336870026525197,44.429708222811676,-10.079575596816973"
		],
		help:
		{
			text: [[10, 12, "The key is still PAIRS!"]]
		}
	},
	{
		// 4-D
		// Reflect across two crosses
		lines :
		[
			[20, 0, 40, 100],
			[50, 0, -20, 100],
			[50, 0, 50, 100],
			[90, 0, -30, 100]
		],
		answer :
			"-0.777431911738535,-0.6289671077334383,0.6289671077334389,-0.7774319117385351,72.5296550278236,79.09450007975053"
		, player :
			[10, 46],
		par: 6,
		obstacles :
		[
			"0.9862068965517242,-0.1655172413793103,0.1655172413793103,0.9862068965517242,48.275862068965516,-20.689655172413786"
			, "0.9823570924488356,0.18701482004234282,-0.18701482004234304,0.9823570924488356,74.27664079040228,12.667607621736074"
			, "0.24615384615384617,-0.9692307692307693,0.9692307692307692,0.24615384615384628,37.6923076923077,48.46153846153845"
			, "0.403183023872679,-0.9151193633952255,0.9151193633952255,0.40318302387267896,-21.88328912466843,66.44562334217507"
			, "0.2249288199936728,0.9743751977222399,-0.9743751977222398,0.22492881999367287,143.94179057260362,19.04460613729832"
		],
		help:
		{
			text: [[10, 12, "Get within range of rotating to the goal\nbefore switching to the next pair!"]],
			lines: [[75, 50, 16, -16, true], [75, 50, -15, -17, true]]
		}
	},
	{
		// 1-V-2-D
		lines :
		[
			[10, 0, 10, 100],
			[50, 0, 0, 100],
			[0, 20, 100, 40]
		],
		answer :
			"0.14999823406835316,0.988686264583652,0.9886862645836523,-0.14999823406835328,6.597520631968052,68.11551547544767"
		, player :
			[10, 46],
		par: 5,
		obstacles :
		[
			"0.9801980198019802,0.19801980198019803,-0.19801980198019803,0.9801980198019802,80.1980198019802,-1.9801980198019801"
		],
		help:
		{
			text: [[10, 20, "You'll need an odd number of flips: a reflection"], [65, 12, "This can be useful!"]],
			lines: [[94, 14, 2, -4]]
		}
	},
	{
		// 2-V-1-D
		lines :
		[
			[30, 0, 20, 100],
			[60, 0, 0, 100],
			[80, 0, 0, 100]
		],
		answer :
			"1,0,0,1.0000000000000002,36.92307692307692,-15.384615384615385"
		, player :
			[10, 46],
		par: 4,
		help:
		{
			text: [
				[4, 12, "You can think of translations as affecting lines,\nbut they do it backwards!"],
				[45, 62, "First"], [85, 62, '"Second"']
			],
			lines: [[70, 0, 20, 100, true], [80, 60, -20, 0], [40, 50, 40, 0]]
		}
	},
	// TODO: Expand on last level more!!
	{
		// 0-V-0-H-3-D
		lines :
		[
			[0, 100, 100, -100],
			[0, 70, 100, -20],
			[0, 30, 100, 40],
		],
		answer :
			"-0.9407299003018386,0.33915668160614654,-0.3391566816061464,-0.9407299003018386,94.59892069880179,82.98271288758804"
		, player :
			[10, 46],
		par: 6,
		help:
		{
			text: [[10, 12, "Look, you're on your own now kid\nWriting help text is hard, ok?"]]
		}
	},
	{
		// 2-V-1-H-1-D
		lines :
		[
			[30, 0, 0, 100],
			[50, 0, 0, 100],
			[0, 70, 100, -30],
			[0, 70, 100, 0]
		],
		answer :
			"0.834862385321101,-0.5504587155963302,0.5504587155963303,0.8348623853211009,34.862385321100916,-10.45871559633028"
		, player :
			[10, 46],
		par: 6
	},
	{
		// 2-V-0-H-2-D
		lines :
		[
			[20, 0, 0, 100],
			[50, 0, 0, 100],
			[10, 0, 90, 70],
			[0, 70, 100, -50]
		],
		answer :
			"-0.24615384615384622,0.9692307692307695,-0.9692307692307695,-0.24615384615384622,76.15384615384615,76.76923076923077"
		, player :
			[10, 46],
		par: 6
	},
	{
		// 1-V-1-H-2-D
		lines :
		[
			[0, 30, 100, 0],
			[40, 0, 0, 100],
			[0, 80, 80, -100],
			[20, 0, 100, 60]
		],
		answer :
			"-0.9641319942611192,-0.26542324246771887,0.265423242467719,-0.9641319942611191,48.26398852223818,90.8464849354376"
		, player :
			[10, 46],
		par: 6
	},
	{
		// Cross with two diagonals
		lines :
		[
			[0, 20, 100, 40],
			[0, 60, 100, -10],
			[40, 0, 0, 100],
			[0, 80, 100, 0]
		],
		answer :
			"-0.7241379310344828,0.6896551724137929,0.689655172413793,0.7241379310344827,42.11676340047798,-5.995220211676354"
		, player :
			[10, 46],
		par: 7
	},
	{
		// Cross with two diagonals, containing a V shape
		// TODO: Delete?
		lines :
		[
			[0, 10, 50, 90],
			[50, 0, 0, 100],
			[0, 60, 100, 0],
			[0, 40, 100, -10]
		],
		answer :
			"0.6106926463383254,0.7918677236182146,-0.7918677236182143,0.6106926463383255,102.80083691920044,46.69157747803904"
		, player :
			[10, 46],
		par: 10
	}
];
