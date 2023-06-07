const docprocess = require('./frm');

async function main() {
    const filePath = 'https://api.twilio.com/2010-04-01/Accounts/AC9ecebb3befc0b83f26cb4cecf15f7ee3/Messages/MMee5681fb9201285d3466390fc1937640/Media/ME2275da3d551c1c799c2fa8026b5117fb';
    //'C:\\Users\\BS505\\Documents\\GitHub\\testbot-image\\1681277604.jpg';
    
    const result = await docprocess(filePath);
    console.log(result); // should print the object {a, b, c, d}

    const { customer, bill, month, amount } = result;

    // Access each field separately:
    console.log(customer['Field Name'], ':', customer['Field Value']);
    console.log(bill['Field Name'], ':', bill['Field Value']);
    console.log(month['Field Name'], ':', month['Field Value']);
    console.log(amount['Field Name'], ':', amount['Field Value']);

}

main();
