import { Matrix } from "./Matrix.js"
import {Clock, Comparator} from "./Coordinates.js"
import util from 'node:util'
import {createHash} from 'node:crypto'
import {Automata} from "./Automata.js"

class Computer{
	constructor(input, output, rules){
		//we want a new automata instance for each successive generation 
		this.input=input
		//check to make sure input does not already equal output
		this.solution(input, output)
		this.output=output
		this.hashes={}
		this.rules=rules
		this.simulate(input, rules, output)
	}

	nextGen(prevGen, rules, output){
		//console.log('here', prevGen.m, prevGen.d)
		var nextGen = new Automata(prevGen.m, prevGen.d)
		prevGen.repopulate(nextGen, prevGen)
		nextGen.neighborhoods(nextGen)

		for(var i = 0; i<prevGen.matrix.matrix.length; i++){
			var neighborhood = nextGen.matrix.matrix[i]['data']['neighborhood']
			nextGen.matrix.matrix[i]['data']['mode']=rules.context(neighborhood)
		}

		var hash = this.hash(JSON.stringify(nextGen.matrix.matrix))
		if(this.solution(nextGen, output)){
			return true
		}
		if(!this.hashes[hash]){
			this.hashes[hash]=hash
			return nextGen
		}else{
			return
		}
	}
	solution(output1, output2){
		var hash1 = this.hash(output1.stringifyMode(output1))
		var hash2 = this.hash(output2.stringifyMode(output2))

		if(hash1==hash2){
			//this is where we want to store some data
			return true
		}
		return false
	}
	hash(string) {
		return createHash('sha256').update(string).digest('hex');
	}

	print(gen, d){
		if(gen.d==1||d==1){
			for(var i=0; i<(this.m); i++){
				process.stdout.write(this.asciiArt(gen.matrix.matrix[i]['data']['mode'])+ " ")
				if((i%(gen.m))==gen.m-1){process.stdout.write('\n')}
			}
		}else{
			console.log()
			for(var i=0; i<(gen.m*gen.m); i++){
				process.stdout.write(this.asciiArt(gen.matrix.matrix[i]['data']['mode'])+ " ")
				if((i%(gen.m))==gen.m-1){process.stdout.write('\n')}
			}
		}
	}

	asciiArt(val){
		if(val==0){
			return String.fromCharCode('9634')
		}
		if(val==1){
			return String.fromCharCode('9635')
		}
	}

	simulate(input, rules, output){
		if(this.solution(input, output)){
			console.log('output')
			this.print(output, 2)
			console.log('generations')
			this.print(input, 2)
			throw Error('input already equals output')
		}
		console.log('output')
		this.print(output, 2)
		console.log('generations')
		this.print(input, 2)
		var automata=input
		while(true){
			automata=this.nextGen(automata, rules, output)
			if(automata==true){
				console.log('solution found!')
				break
			}else if(!automata){
				throw Error('solution not found')
			}else{
				this.print(automata, 2)
			}
		}
	}
}

class Rules{
	constructor(m, d){
		this.m=m
		this.d=d
		this.rule_map=this._rule_map()
		this.context_map=this._context_map(this.rule_map)
	}
	export(){
		return this.context_map
	}
	_rule_map(){
		//we know we have (3^(2^d)) rule possibilities because a neighbor is either 1, 0, or null
		//we need to map the possible contexts to these rules
		var map={}
		for(var i =0; i<Math.pow(3, 2*this.d); i++){
			map[i]=Math.floor(Math.random() * 2)
		}
		//the map should have a rule number along side the rule for the number
		return map
	}
	_context_map(rule_map){
		//context should interpret the rule number and call upon map to return the rule
		//there should be 2^d cells in any neighborhood (some neighbors are null)
		//we know that there are 3^(2^d) rules derived from 2^d cells
		var context_map={}
		//we want to derive a number from 0 to 3^(2^d) from the context and create a context map connected to the rule map
		//so if there are four neighbors max, we want to translate these combinatoric contexts into strings (we can substitute -1 for null)
		//we need the max number of neighbors which is 2*d (which is the number of dimensions in a coordinate plane)
		var coordinate1=[]
		var coordinate2=[]
		for(var i = 0; i<(2*this.d); i++){
			coordinate1.push(0)
			coordinate2.push(2)
		}
		var ticks = new Clock(coordinate1, coordinate2).ticks()
		for(var i = 0; i<ticks.length; i++){
			var string=''
			for(var j =0; j<ticks[i].length; j++){
				
				string+=ticks[i][j]
			}
			context_map[string]=this.rule_map[i]
		}
		//console.log(context_map)
		return context_map
		//(-1, -1, -1, -1) ... (1, 1, 1, 1)
	}
	context(neighborhood){
		//should translate neighborhood to context and return the rule using context_map connected to rule_map
		//console.log(neighborhood)
		var string=''
		for(var i = 0; i<neighborhood.length; i++){
			
			if(neighborhood[i]==null){
				string+=0
			}else if(neighborhood[i]==0){

				string+=1
			}else if(neighborhood[i]==1){

				string+=2
			}
		}
		
		return this.context_map[string]
	}
}

var input = new Automata(2, 3)
var output = new Automata(2, 3)
var rules = new Rules(2, 3)
//input.log(input)
//output.log(output)
//console.log(rules._context_map())
new Computer(input, output, rules)