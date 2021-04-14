
module.exports = {
    name: "suggest",
    description: `Suggest a feature for Sir Countalot`,
    permissions: `Be TheWaildug (as of right now)`,
    async execute(message,args,trello){
        if(message.member.id != "432345618028036097"){
            return message.delete();
        }
        console.log(`suggest`)
        trello.board.searchCards().then(function (response) {
            console.log('response ', response);
        }).catch(function (error) {
            console.log('error', error);
        });    
        
    }
}