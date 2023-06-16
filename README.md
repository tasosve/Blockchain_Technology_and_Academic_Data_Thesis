# Blockchain_Technology_and_Academic_Data_Thesis
This is my thesis project repository.

The client is pushed as the client-feature branch.

This dApp is a proof of consept, tha a academic system can print a degree as an NFT.

User logs in with metamask, clicks the print button that trigers the oracle part of the server to connect with a smart contract.
The contract mints a token mapped to the students address and sends the token to the oracle, then the oracle responds to the request with the tokenId.
A link will appear, if clicked the pdf that represents the degree will open in a new window.

//the oracle is considered a computing oracle, because of all the calculations tha does off chain, like calclulating the students grade and more.
