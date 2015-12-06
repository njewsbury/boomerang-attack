## COMP 4140 - Research Project Proposal ##
### Analyzing Vulnerabilities in SHA-0 ###
#### Searching for Collisions in SHA-0 ####
By: Nathan Jewsbury (7614402) & Tim Sands (7688626)
___

Cryptographic hash functions are commonplace in many web based applications and in signed communications. One commonly used family of Cryptographic hashes is the "Secure Hash Algorithm" or SHA family developed by the United States National Security Agency (NSA) and published by the National Institute of Standards and Technology (NIST). SHA or SHA-0 as it was later known was the first published algorithm in the SHA family, however it was determined to be too vulnerable and it was quickly replaced by SHA-1. 

The goal of this project is to explore the vulnerability of SHA-0 and provide analysis of modern attack methods. The most popular attack method uses a combination of techniques stemming from the Boomerang attack. Previous attacks with optimized conditions resulted in a collision in roughly an hour after computing an estimated 233 hashes performed by Manuel and Peyrin in 2008.


### References ###
https://en.wikipedia.org/wiki/Boomerang_attack
http://www.quadibloc.com/crypto/co4512.htm

https://www.iacr.org/archive/crypto2007/46220242/46220242.pdf - In regards to SHA-1, mentions SHA-0
http://link.springer.com/chapter/10.1007%2F978-3-540-71039-4_2

https://nodejs.org/en/about/
http://crypto.stackexchange.com/questions/20649/sha1-collisions-what-about-practical-attacks
