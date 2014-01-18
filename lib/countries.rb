file = File.new('../data/countries.html')
print "[\n"
while (line = file.gets)
  m =  /<a href="([^"]*)">([^<]*)<.a>/.match(line)
  if (m) 
    print "{ 'name': '" + m[2] + "', 'link': '" + m[1] + "'},\n"
  end
end
print "]\n"