#include <iostream>
#include<cstring>
using namespace std;

int main()
{
    string s1;
    string s2;
     cin >> s1;
    int j=0;
    
    for (int i = 0; i < s1.size(); i++)
    {
        if(i%2==0 || i==0){
           strncpy(s2, s1[i]);
            j++;
            cout<<s2[j];
        }
    }
   // s2[j]='\0';
    
}