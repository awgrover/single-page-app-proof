# App name, i.e the single page
app := proof

# override to 'development' for more debug'ability
CONTEXT := production

pouchvers := 5.3.0


ifeq ($(CONTEXT), production)
jssize := min
else
jssize := max
endif

.PHONY : all
all : pouchdb-$(pouchvers).$(jssize).js pouchdb-5.3.0.js

$(app).zip : all build/$(app)/pouchdb-$(pouchvers).js build/$(app)/$(app).html build/$(app)/app.js
	cd build &&\
	zip ../$(app).zip $(app)/* 

.PHONY : pouchdb-version
pouchdb-version :
	@ echo $(pouchvers)

# Force relink
.PHONY : pouchdb-$(pouchvers).js
pouchdb-$(pouchvers).js : 
	ln -f -s pouchdb-$(pouchvers).$(jssize).js $@

pouchdb-$(pouchvers).min.js : 
	wget -O $@ https://cdn.jsdelivr.net/pouchdb/$(pouchvers)/pouchdb.min.js

pouchdb-$(pouchvers).max.js : 
	wget -O $@ https://cdn.jsdelivr.net/pouchdb/$(pouchvers)/pouchdb.js
	# wget -O $@ https://github.com/pouchdb/pouchdb/releases/download/$(pouchvers)/pouchdb-$(pouchvers).js

build/$(app) :
	mkdir -p $@

build/$(app)/$(app).html : $(app).html build/$(app)
	cp $< $@

build/$(app)/app.js : app.js build/$(app)
	cp $< $@

build/$(app)/pouchdb-$(pouchvers).js : pouchdb-$(pouchvers).min.js
	cp $< $@
