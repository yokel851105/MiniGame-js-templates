import os  
import os.path  
import shutil 
import stat
# import oss2

#1.cocos creator complie Wechat Game to Wechat_devtoolsWebPack_Demo/
os.system('/Applications/CocosCreator.app/Contents/MacOS/CocosCreator --path ../MiniGame-templates/ --build "autoComplie=true"');

def copytree(src, dst, symlinks=False):  
    names = os.listdir(src)  
    if not os.path.isdir(dst):  
        os.makedirs(dst)  
          
    errors = []  
    for name in names:  
        srcname = os.path.join(src, name)  
        dstname = os.path.join(dst, name)  
        try:  
            if symlinks and os.path.islink(srcname):  
                linkto = os.readlink(srcname)  
                os.symlink(linkto, dstname)  
            elif os.path.isdir(srcname):  
                copytree(srcname, dstname, symlinks)  
            else:  
                if os.path.isdir(dstname):  
                    os.rmdir(dstname)  
                elif os.path.isfile(dstname):  
                    os.remove(dstname)  
                shutil.copy2(srcname, dstname)  
           
        except (IOError, os.error) as why:  
            errors.append((srcname, dstname, str(why)))  
        
        except OSError as err:  
            errors.extend(err.args[0])  
    # try:  
    #     copystat(src, dst)  
    # except OSError as why:  
    #     errors.extend((src, dst, str(why)))  
    # if errors:  
    #     raise Error(errors)  
    #2. copy open data context to main projectdef  del_file(path):
      
def delete_file(filePath):
    if os.path.exists(filePath):
        for fileList in os.walk(filePath):
            for name in fileList[2]:
                os.chmod(os.path.join(fileList[0],name), stat.S_IWRITE)
                os.remove(os.path.join(fileList[0],name))
        # shutil.rmtree(filePath)
        return "delete ok"
    else:
        return "no filepath"
if __name__ == '__main__':  
    # copytree('/Users/Innotech/Desktop/MZGame/MZGame2.0.0/MZGame/build/openData/', '/Users/Innotech/Desktop/MZGame/MZGame2.0.0/MZGame/build/wechatgame/')
    # delete_file('/Users/Innotech/Desktop/MZGame/MZGame2.0.0/MZGame/build/res/')
    print('--------------delete   res   ok ---------')
    # copytree('/Users/Innotech/Desktop/MZGame/MZGame2.0.0/MZGame/build/wechatgame/res/', '/Users/Innotech/Desktop/MZGame/MZGame2.0.0/MZGame/build/res')
    # print('--------------copy res ok----------')
    

    # delete_file('/Users/Innotech/Desktop/MZGame/MZGame2.0.0/MZGame/build/wechatgame/res/')
    # print('--------------copy res to build ok ---------')
    # 3.auto publish wechat game
    # os.system('/Applications/wechatwebdevtools.app/Contents/MacOS/cli -u 1.0.0@/Users/Innotech/Desktop/MZGame/MZGame2.0.0/MZGame/build/wechatgame --upload-desc "upload publish 2.0.0"')
    print('--------------copy  upload sucess  ---------')


  
# auth = oss2.Auth('LTAIsbbnXwkLRPEy', 'BFZ6PqUCZanCV1g0hN2aSXTgsXF6WK')
# bucket = oss2.Bucket(auth, 'http://oss-cn-beijing.aliyuncs.com', 'miaogame')
# with open('/Users/Innotech/Desktop/MZGame/MZGame2.0.0/MZGame/build/wechatgame', 'rb') as fileobj:
  
#     fileobj.seek(1000, os.SEEK_SET)
   
#     current = fileobj.tell()
#     bucket.put_object('miaogame', fileobj)