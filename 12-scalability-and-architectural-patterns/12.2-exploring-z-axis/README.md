Throught this chapter we did not show you any example about how to shard data across multiple instances, but we explored
all the necessary patterns to build an application that achives scalability alongs the Z-axis of the scale cube.(the domain/context axis)

In this exercise,  you are challenged to build a REST API that allows you get the list of (randomly generated) people whose first name starts with a given letter.
You could also use a library like 'faker' to generate sample of random people, and then you could store this data in different JSON files or databases, splitting the data into
3 different groups. For instance, you might have three groups, A-D, E-P, Q-Z. Now you can run one or more instnaces of a web server for every group but you should
expose only one public API endpoint. 

HINT: You can use a loadbalance or create an APi orchestration layer that encodes the mapping logic and redirects the traffic accordingly.
can you also throw a service discovery tool into the mix and apply dynamic load balancing so that groups receiving more traffic can scale as needed?