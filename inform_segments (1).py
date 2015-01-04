print('''   To get information about segments, call function:
inform_segments.segm(pathdir_Raid),where " pathdir_Raid"
is the full pathname of the directory, which just includes
Raid's directories with days' files in the form: 'C:\\...\\*\\*'.                                            

   To print the list of the working segments, call function:
inform_segments.pr_w_segm(fr, to)
   To print the list of the excepted segments, call function:
inform_segments.pr_exc_segm(fr, to).
   Both with parameters, which point range of lines(for
example (0,10).''')

import glob
import csv
working_segm =[]; excepted_segm = []  
def segm(pathdir_Raid):
                '''Creates or modefies list 'working_segm' with 2 items:
[Segmemts | First data ];and list 'excepted_segm' with 3 items:
[Segments | Fist date/time | Output data/time,for every segment;
returns number of segments in these lists after the runnign''' 
                global excepted_segm , working_segm  
                print('number of working segments befor the running is', len(working_segm)/2)
                print('number of excepted_segments befor the running is', len(excepted_segm)/3) 
                for file in  glob.glob(pathdir_Raid):
                        j=0;r=0; k=0
                        m=0; d = [];i=len(working_segm);n=len(excepted_segm); f=open(file, 'r+')
                        a= f.readline(); b=a[-29:-1]+'y' 
                        for line in f:
                            if 'Segment' in line:
                                    c=line[-28:-1]
                                    d[j:j]=[c] #Creates current list(d)of segments' names for the every hour
                                    j=j+2
                #Forms list of the working segments by compared old 'working_segm' with current d-list 
                                    if c in working_segm:                                                            
                                        pass
                                    else:
                                        working_segm[i:i]= [c, ' | ' +  a[-29:-10] + ' | ']
                                        i = i+2
                        else:
                                pass
               #Forms list of the excepted segments by compared  'working_segm' with current d-list  
                        while 2*k < len(working_segm):
                            if working_segm[2*k] in d:
                                k=k+1
                            else:
                                if working_segm[2*k] in excepted_segm:
                                    k=k+1
                                    working_segm[2*k:2*(k+1)] = [] #Deleting of the excepted segments (during repeated runs).
                                else:  #Forms list of the excepted segments.
                                    excepted_segm[n:n] = working_segm[2*k:2*(k+1)] + [b]
                                    working_segm[2*k:2*(k+1)] = []
                                    k=k+1
                                    n=n+3
                        while 3*m < len(excepted_segm):
                            if excepted_segm[3*m] in working_segm:
                                excepted_segm[3*m:3*(m+1)] = [] #for repeated runs.
                                r=r+1
                                m=m+1
                            else:
                                m=m+1
                        f.close()
                return ['number of working segments ->', len(working_segm)/2,\
                        'number of excepted_segments ->', len(excepted_segm)/3]
          
def pr_w_segm(fr, to):
	"""Pints list of  working segments with items:\
[ Segmrnt | First data/time ]; from 'fr' segment down 'to' one"""
	tamp = []
	j = 0
	while j < int(len( working_segm)/2):
		tamp.append( working_segm[2*j:2*(j+1)])
		j=j+1
	tit2=[1]; tit2[0] = ['        Segment                |    First date/time   ','']
	ld2 = tit2 + tamp[2*fr:2*to]
	with open('fa3.pym', 'w', newline='') as f:
		writer = csv.writer(f)
		writer.writerows(ld2)
	for i1 in [0]:
		f2 = open('fa3.pym', 'r+')
	while i1 < len(ld2):
		print(f2.readline())
		i1 = i1+1
	f2.close

def pr_exc_segm(fr, to):
	"""Pints list of excepted segments with items:\
[ Segmrnt | First data/time | Outpur data/timefrom ]; from 'fr' segment down 'to' one"""
	tamp = []
	j = 0
	while j < int(len( excepted_segm)/3):
		tamp.append( excepted_segm[3*j:3*(j+1)])
		j=j+1
	tit2=[1]; tit2[0] =\
              ['        Segment                |   First date/time   |     Output data/time         ','','']
	ld2 = tit2 + tamp[3*fr:3*to]
	with open('fa3.pym', 'w', newline='') as f:
		writer = csv.writer(f)
		writer.writerows(ld2)
	for i1 in [0]:
		f2 = open('fa3.pym', 'r+')
	while i1 < len(ld2):
		print(f2.readline())
		i1 = i1+1
	f2.close



			


       
