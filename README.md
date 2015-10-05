## COMP 4140 - Research Project Proposal ##
### Web-Based Boomerang Attack ###
#### Finding Collisions in SHA-0 ####
By: Nathan Jewsbury (7614402) & Tim Sands (7688626)
___

The family of Secure Hash Algorithms (SHA) are still actively used in a number of applications. Recently, however, many organizations have deprecated the use of SHA0 and SHA1 algorithms due to weaknesses found. Between 2004 and 2008 a series of attacks were performed that reduced the number of operations required to find collisions in both SHA-0 and SHA-1.

This project seeks to replicate one such attack, the Boomerang Attack, found in 2008 using an easily accessible entry point: Web Facing clients. Through brief searching no such project has been completed before, this attack is typically completed offline. Depending on the parallelizability of the Boomerang attack a nodejs server could be introduced, to offload the attack onto willing clients, decreasing the overall wait time for requesting clients.
While specifically targeting SHA-0, this implementation may also have application on other hashing functions such as SHA-1 which was more widely adopted.

Topics covered by this project will be focused on three areas. The hashing algorithm implementation and the theoretical limits SHA-0 offers, implementations of the Boomerang attack and its recent advancements and the power of modern browsers to implement such attacks. When the attack on SHA-0 was discovered, in 2008, the number of operations to find such collisions was 2^33.6 taking roughly one hour on an average PC. Using the results from 2008 as a base line, determining performance using modern day browsers and hardware would also be of interest.


### References ###
https://en.wikipedia.org/wiki/Boomerang_attack
http://www.quadibloc.com/crypto/co4512.htm

https://www.iacr.org/archive/crypto2007/46220242/46220242.pdf - In regards to SHA-1, mentions SHA-0
http://link.springer.com/chapter/10.1007%2F978-3-540-71039-4_2

https://nodejs.org/en/about/
http://crypto.stackexchange.com/questions/20649/sha1-collisions-what-about-practical-attacks
